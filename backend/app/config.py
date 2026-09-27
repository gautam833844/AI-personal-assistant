import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    NVIDIA_API_KEY: str = Field(default="", description="NVIDIA API Catalog Key")
    NVIDIA_BASE_URL: str = Field(
        default="https://integrate.api.nvidia.com/v1",
        description="NVIDIA NIM Base URL"
    )
    NVIDIA_MODEL: str = Field(
        default="moonshotai/kimi-k3",
        description="Primary NVIDIA NIM Model"
    )
    NVIDIA_MODELS: str = Field(
        default="moonshotai/kimi-k3,meta/llama-3.2-11b-vision-instruct,nvidia/nemotron-3-super-120b-a12b,nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
        description="Comma-separated pool of models in priority order for multi-model failover"
    )
    MODEL_TIMEOUT_SECONDS: float = Field(
        default=20.0,
        description="Timeout per model attempt before failing over to next model in pool"
    )
    HOST: str = Field(default="0.0.0.0", description="Backend Host")
    PORT: int = Field(default=8000, description="Backend Port")
    DEBUG: bool = Field(default=True, description="Debug mode")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def get_model_pool(self) -> List[str]:
        """Returns ordered, deduplicated list of models from NVIDIA_MODEL and NVIDIA_MODELS."""
        models: List[str] = []
        if self.NVIDIA_MODEL and self.NVIDIA_MODEL.strip():
            models.append(self.NVIDIA_MODEL.strip())
        
        for m in self.NVIDIA_MODELS.split(","):
            cleaned = m.strip()
            if cleaned and cleaned not in models:
                models.append(cleaned)
        
        return models

settings = Settings()
