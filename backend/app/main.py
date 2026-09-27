import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .models.chat import ChatRequest, ChatResponse, ChatMessage
from .services.nvidia_client import nvidia_service

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("personal_assistant_api")

app = FastAPI(
    title="Personal Assistant (Atlas) API",
    description="FastAPI Backend integrating NVIDIA NIM for autonomous structured tool calling.",
    version="1.0.0"
)

# CORS middleware for mobile Expo client connectivity across local LAN
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Personal Assistant API is running.",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health_check():
    is_nvidia_set = bool(
        settings.NVIDIA_API_KEY
        and not settings.NVIDIA_API_KEY.startswith("your_")
    )
    return {
        "status": "ok",
        "service": "personal-assistant-backend",
        "nvidia_configured": is_nvidia_set,
        "model": settings.NVIDIA_MODEL,
        "base_url": settings.NVIDIA_BASE_URL
    }

@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        response = await nvidia_service.chat(
            messages=request.messages,
            user_context=request.userContext
        )
        return response
    except Exception as e:
        logger.error(f"Chat request failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"NVIDIA NIM processing error: {str(e)}"
        )

@app.post("/api/v1/test-nvidia")
async def test_nvidia_endpoint():
    """Diagnostic endpoint to test NVIDIA API credentials and latency."""
    if not settings.NVIDIA_API_KEY or settings.NVIDIA_API_KEY.startswith("your_"):
        return {
            "status": "warning",
            "message": "NVIDIA_API_KEY is not set in backend/.env. Running in local mock mode."
        }

    try:
        test_msg = [ChatMessage(role="user", content="Hello, reply in one word.")]
        resp = await nvidia_service.chat(messages=test_msg)
        return {
            "status": "success",
            "model": settings.NVIDIA_MODEL,
            "response": resp.response
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
