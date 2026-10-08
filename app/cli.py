import uvicorn

def dev():
  uvicorn.run("app.main:app", reload=True, port=8000)