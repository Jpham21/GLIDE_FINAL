#!/bin/bash

# Check if the script is running on Windows
if [[ "$OS" == "Windows_NT" ]]; then
    # Windows: Activate the virtual environment and run the backend
    ./venv/Scripts/activate
else
    # Unix-based systems (Linux/Mac): Activate the virtual environment
    source venv/bin/activate
fi

# Start the FastAPI backend
uvicorn app.main:app --reload
