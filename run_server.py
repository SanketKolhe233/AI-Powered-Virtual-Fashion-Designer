#!/usr/bin/env python3
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    
    print("Starting Fashion AI Backend Server...")
    print("Server will be available at: http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)