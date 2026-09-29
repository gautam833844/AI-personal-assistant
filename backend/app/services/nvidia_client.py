import asyncio
import json
import logging
import sys
import types
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

# Ensure compatibility on Windows platforms where jiter binary DLL may be restricted by security policies
try:
    import jiter
except ImportError:
    jiter_shim = types.ModuleType("jiter")
    jiter_shim.from_json = lambda b, **kwargs: json.loads(b.decode("utf-8") if isinstance(b, (bytes, bytearray)) else b)
    jiter_shim.cache_clear = lambda: None
    sys.modules["jiter"] = jiter_shim

from openai import AsyncOpenAI
from ..config import settings
from ..models.chat import ChatMessage, UserContext, ChatResponse, ParsedToolCall
from ..schemas.tools import NVIDIA_TOOLS
from .prompt_builder import build_system_prompt

logger = logging.getLogger(__name__)

READ_ONLY_SCHEDULE_TOOLS = {"get_schedule", "show_schedule", "show_next_class", "show_tomorrow"}

def resolve_schedule_query(
    day_arg: Optional[str],
    schedule: Optional[List[Dict[str, Any]]] = None,
    now: Optional[datetime] = None
) -> str:
    """
    Authoritatively resolve schedule queries from the user context without hallucination.
    """
    if now is None:
        now = datetime.now()

    day_lower = (day_arg or "today").strip().lower()
    days_map = {
        "monday": "Monday",
        "tuesday": "Tuesday",
        "wednesday": "Wednesday",
        "thursday": "Thursday",
        "friday": "Friday",
        "saturday": "Saturday",
        "sunday": "Sunday"
    }

    if day_lower == "today":
        target_day = now.strftime("%A")
    elif day_lower == "tomorrow":
        target_day = (now + timedelta(days=1)).strftime("%A")
    elif day_lower in days_map:
        target_day = days_map[day_lower]
    else:
        matched_day = None
        for d_key, d_val in days_map.items():
            if d_key in day_lower:
                matched_day = d_val
                break
        target_day = matched_day or now.strftime("%A")

    events = schedule or []
    matched_events = []
    for ev in events:
        ev_days = [str(d).lower() for d in (ev.get("days") or ([ev.get("day")] if ev.get("day") else []))]
        if target_day.lower() in ev_days:
            title = ev.get("title", "Event")
            time_str = ev.get("time", "")
            loc = ev.get("location", "")
            etype = ev.get("type", "class")
            desc = f"{title} ({etype}) at {time_str}" + (f" in {loc}" if loc else "")
            matched_events.append((ev, desc))

    if not matched_events:
        return f"No classes or events scheduled for {target_day}."

    if day_lower in ("today", "now") or target_day == now.strftime("%A"):
        upcoming = []
        past = []
        for ev, desc in matched_events:
            time_str = ev.get("time", "")
            try:
                ev_dt = datetime.strptime(time_str.strip(), "%I:%M %p").replace(
                    year=now.year, month=now.month, day=now.day
                )
                if ev_dt < now:
                    past.append(desc)
                else:
                    upcoming.append(desc)
            except Exception:
                upcoming.append(desc)
        details = []
        if upcoming:
            details.append("Upcoming: " + "; ".join(upcoming))
        if past:
            details.append("Already passed today: " + "; ".join(past))
        return f"Schedule for {target_day} (Current time: {now.strftime('%I:%M %p')}): " + " | ".join(details)

    return f"Schedule for {target_day}: " + "; ".join(desc for _, desc in matched_events)

class NvidiaNimService:
    def __init__(self):
        self._client: Optional[AsyncOpenAI] = None
        self._cached_api_key: str = ""

    @property
    def client(self) -> AsyncOpenAI:
        current_key = settings.NVIDIA_API_KEY.strip()
        if self._client is None or self._cached_api_key != current_key:
            self._cached_api_key = current_key
            api_key = current_key if current_key else "nvapi-not-set"
            self._client = AsyncOpenAI(
                base_url=settings.NVIDIA_BASE_URL,
                api_key=api_key
            )
        return self._client

    async def chat(
        self,
        messages: List[ChatMessage],
        user_context: Optional[UserContext] = None,
        requested_model: Optional[str] = None
    ) -> ChatResponse:
        # Check if API key is provided
        if not settings.NVIDIA_API_KEY or settings.NVIDIA_API_KEY.startswith("your_"):
            return ChatResponse(
                response="NVIDIA API Key is not yet configured in backend/.env. Please add your NVIDIA API key from https://build.nvidia.com/ to test live LLM inference.",
                tool_calls=[],
                provider="mock_unconfigured",
                model=settings.NVIDIA_MODEL,
                attempts=[],
                fallback_triggered=False
            )

        system_prompt = build_system_prompt(user_context)

        api_messages = [{"role": "system", "content": system_prompt}]
        for m in messages:
            api_messages.append({"role": m.role, "content": m.content})

        # Build prioritized multi-model candidate list
        candidate_models: List[str] = []
        if requested_model and requested_model.strip():
            candidate_models.append(requested_model.strip())
        
        for m in settings.get_model_pool():
            if m not in candidate_models:
                candidate_models.append(m)

        attempted_models: List[str] = []
        last_error: Optional[Exception] = None

        logger.info(f"[Multi-Model Engine] Candidate models: {candidate_models}")

        for model_name in candidate_models:
            attempted_models.append(model_name)
            logger.info(f"[Multi-Model Engine] Attempting model: {model_name} (timeout={settings.MODEL_TIMEOUT_SECONDS}s)")

            try:
                # Execute completion with per-model timeout
                response = await asyncio.wait_for(
                    self.client.chat.completions.create(
                        model=model_name,
                        messages=api_messages,
                        tools=NVIDIA_TOOLS,
                        tool_choice="auto",
                        temperature=0.2,
                        max_tokens=1024,
                    ),
                    timeout=settings.MODEL_TIMEOUT_SECONDS
                )

                choice = response.choices[0]
                message = choice.message
                content = message.content or ""
                parsed_tools: List[ParsedToolCall] = []

                if message.tool_calls:
                    for tc in message.tool_calls:
                        fn_name = tc.function.name
                        try:
                            fn_args = json.loads(tc.function.arguments)
                        except Exception:
                            fn_args = {}
                        parsed_tools.append(
                            ParsedToolCall(
                                id=tc.id or f"call_{fn_name}",
                                name=fn_name,
                                arguments=fn_args
                            )
                        )

                # Check for read-only schedule tool calls
                schedule_tool_calls = [
                    tc for tc in (message.tool_calls or [])
                    if tc.function.name in READ_ONLY_SCHEDULE_TOOLS
                ]

                if schedule_tool_calls:
                    follow_messages = list(api_messages)
                    follow_messages.append({
                        "role": "assistant",
                        "content": message.content,
                        "tool_calls": [
                            {
                                "id": tc.id,
                                "type": "function",
                                "function": {
                                    "name": tc.function.name,
                                    "arguments": tc.function.arguments,
                                }
                            }
                            for tc in message.tool_calls
                        ]
                    })

                    tool_result = ""
                    for tc in schedule_tool_calls:
                        try:
                            fn_args = json.loads(tc.function.arguments)
                        except Exception:
                            fn_args = {}
                        day_val = fn_args.get("day") or "today"
                        schedule_data = user_context.schedule if user_context else []
                        tool_result = resolve_schedule_query(day_val, schedule_data)
                        follow_messages.append({
                            "role": "tool",
                            "tool_call_id": tc.id,
                            "name": tc.function.name,
                            "content": tool_result
                        })

                    # Second turn completion to get natural language synthesis
                    try:
                        second_response = await asyncio.wait_for(
                            self.client.chat.completions.create(
                                model=model_name,
                                messages=follow_messages,
                                temperature=0.2,
                                max_tokens=1024,
                            ),
                            timeout=settings.MODEL_TIMEOUT_SECONDS
                        )
                        second_msg = second_response.choices[0].message
                        if second_msg.content and second_msg.content.strip():
                            content = second_msg.content.strip()
                        else:
                            content = tool_result
                    except Exception as err:
                        logger.warning(f"Second turn completion for schedule tool failed: {err}")
                        content = tool_result

                    # Filter out resolved read-only schedule tools from parsed_tools
                    parsed_tools = [
                        t for t in parsed_tools if t.name not in READ_ONLY_SCHEDULE_TOOLS
                    ]

                if not content and parsed_tools:
                    mutating_tools = [t for t in parsed_tools if t.name not in READ_ONLY_SCHEDULE_TOOLS]
                    if mutating_tools:
                        tool_names = ", ".join(t.name.replace("_", " ") for t in mutating_tools)
                        content = f"I've prepared the following action for you: {tool_names}."

                fallback_occurred = len(attempted_models) > 1
                if fallback_occurred:
                    logger.info(f"[Multi-Model Engine] Successfully responded using fallback model: {model_name}")
                else:
                    logger.info(f"[Multi-Model Engine] Successfully responded with primary model: {model_name}")

                return ChatResponse(
                    response=content,
                    tool_calls=parsed_tools,
                    provider="nvidia_nim",
                    model=model_name,
                    attempts=attempted_models,
                    fallback_triggered=fallback_occurred
                )

            except asyncio.TimeoutError as e:
                logger.warning(
                    f"[Multi-Model Engine] Model {model_name} timed out after {settings.MODEL_TIMEOUT_SECONDS}s. Failing over..."
                )
                last_error = e
                continue

            except Exception as e:
                logger.warning(
                    f"[Multi-Model Engine] Model {model_name} failed ({type(e).__name__}: {str(e)[:120]}). Failing over..."
                )
                last_error = e
                continue

        # If all candidate models in the pool failed
        logger.error(f"[Multi-Model Engine] All {len(candidate_models)} models in pool failed. Last error: {last_error}")
        raise RuntimeError(f"All candidate models in multi-model pool failed. Attempted: {attempted_models}. Last error: {last_error}")

nvidia_service = NvidiaNimService()

