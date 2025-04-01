from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from api.routes import router

# Create data directories if they don't exist
if not os.path.exists("data"):
    os.makedirs("data")

if not os.path.exists("data/documents"):
    os.makedirs("data/documents")

if not os.path.exists("data/plots"):
    os.makedirs("data/plots")

app = FastAPI(root_path='/api')

# List of allowed origins
origins = [
    "http://localhost:5173",
    "http://vcm-45508.vm.duke.edu",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:8080",
    "http://localhost"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(router)
    
    
