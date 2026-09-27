from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(description="Message role: 'user', 'assistant', or 'system'")
    content: str = Field(description="Text content of the message")

class UserContext(BaseModel):
    userName: Optional[str] = "Gautam"
    assistantName: Optional[str] = "Atlas"
    degree: Optional[str] = None
    branch: Optional[str] = None
    tasks: Optional[List[Dict[str, Any]]] = []
    plans: Optional[List[Dict[str, Any]]] = []
    notes: Optional[List[Dict[str, Any]]] = []
    reminders: Optional[List[Dict[str, Any]]] = []
    schedule: Optional[List[Dict[str, Any]]] = []

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    userContext: Optional[UserContext] = None
    model: Optional[str] = Field(default=None, description="Optional target model to try first")

class ParsedToolCall(BaseModel):
    id: str
    name: str
    arguments: Dict[str, Any]

class ChatResponse(BaseModel):
    response: str
    tool_calls: List[ParsedToolCall] = []
    provider: str = "nvidia_nim"
    model: str = "meta/llama-3.2-11b-vision-instruct"
    attempts: List[str] = []
    fallback_triggered: bool = False
