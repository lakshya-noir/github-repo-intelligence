from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(title="CodeAtlas")

# Allow all origins so any frontend deployment (Vercel, etc.) can reach this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "CodeAtlas API Running"}

@app.get("/health")
def health():
    return {"status": "ok"}
