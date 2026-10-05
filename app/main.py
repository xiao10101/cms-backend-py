from fastapi import FastAPI

from app.core.config import get_settings
settings = get_settings()
app = FastAPI(title=settings.app_name, docs_url="/docs" if settings.debug else None)


@app.get("/health")
async def health():
    return {"status": "ok"}
