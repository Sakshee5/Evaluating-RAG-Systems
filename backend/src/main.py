from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path
from api.routes import router

# Create data directories if they don't exist
data_dir = Path("data")
data_dir.mkdir(exist_ok=True)

documents_dir = data_dir / "documents"
documents_dir.mkdir(exist_ok=True)

visualizations_dir = data_dir / "visualizations"
visualizations_dir.mkdir(exist_ok=True)

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

@app.get("/static/{session_id}/{filename}")
async def get_visualization(session_id: str, filename: str):
    file_path = visualizations_dir / session_id / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Visualization not found")
    return FileResponse(str(file_path))

# Mount the visualizations directory as a static directory
app.mount("/api/static", StaticFiles(directory=str(visualizations_dir), html=True), name="static")

# Include the router
app.include_router(router)
    
    
