"""
Main FastAPI Application Entry Point - ICEGUARD AI
Antarctic Sea-Ice, Iceberg Trajectory & Navigation Decision Support Backend
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..database.repository import get_repository
from ..ml.sea_ice.predict import get_loaded_model as load_sea_ice_model
from ..ml.iceberg_trajectory.predict import get_loaded_model as load_trajectory_model

from .routes import (
    health,
    sea_ice,
    icebergs,
    risk,
    routes,
    satellite,
    models,
    copilot,
    alerts,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed database and load ML model checkpoints
    print("[ICEGUARD AI] Initializing backend services & database...")
    repo = get_repository()
    repo.seed_if_empty()

    print("[ICEGUARD AI] Loading Sea-Ice and Iceberg Trajectory ML checkpoints...")
    try:
        load_sea_ice_model()
        load_trajectory_model()
        print("[ICEGUARD AI] Machine Learning models loaded successfully.")
    except Exception as e:
        print(f"[ICEGUARD AI] Warning loading models on startup: {e}")

    yield

    print("[ICEGUARD AI] Shutting down backend services...")

app = FastAPI(
    title="ICEGUARD AI - Antarctic Maritime Intelligence API",
    description="Backend decision support API for Antarctic sea-ice forecasting, iceberg trajectory prediction with calibrated uncertainty cones, multi-factor navigation risk assessment, and Pareto route optimization.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js frontend (port 3000) and other operational interfaces
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(sea_ice.router, prefix="/api")
app.include_router(icebergs.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(routes.router, prefix="/api")
app.include_router(satellite.router, prefix="/api")
app.include_router(models.router, prefix="/api")
app.include_router(copilot.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.api.main:app", host="0.0.0.0", port=8000, reload=True)
