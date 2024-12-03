from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import arduino  # Import your API routes for Arduino

# Create the FastAPI app instance
app = FastAPI()

# CORS Middleware: Allow frontend and backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust origins if needed for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Arduino routes with a prefix
app.include_router(arduino.router, prefix="/arduino")

# Root endpoint (Optional: Health check or welcome message)
@app.get("/")
def read_root():
    return {"message": "Arduino Control API is running"}

