import asyncio
import uvicorn

from scripts.seed import main


def dev():
  uvicorn.run("app.main:app", reload=True, port=8000)

def seed():
  asyncio.run(main())