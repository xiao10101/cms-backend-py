from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    debug: bool = False
    app_name: str = "CMS Admin API"
    database_url: str
    redis_url: str
    celery_broker_url: str
    celery_result_backend: str
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7


@lru_cache
def get_settings():
    return Settings()
