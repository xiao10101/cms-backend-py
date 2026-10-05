from fastapi import FastAPI

app = FastAPI(title="CMS Admin API")

@app.get("/health")
def health():
    return {"status": "ok"}
