import uvicorn
from app.config import settings

if __name__ == "__main__":
    print(f"Starting Personal Assistant FastAPI Server on {settings.HOST}:{settings.PORT}...")
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
