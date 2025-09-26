from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import discoveries, items, ships, technics, npcs, quests, cities, recipes, shipwrecks, treasuremaps, consumables
import os

app = FastAPI(title="DHO Database API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(discoveries.router)
app.include_router(items.router)
app.include_router(ships.router)
app.include_router(technics.router)
app.include_router(npcs.router)
app.include_router(quests.router)
app.include_router(cities.router)
app.include_router(recipes.router)
app.include_router(shipwrecks.router)
app.include_router(treasuremaps.router)
app.include_router(consumables.router)


dist_dir = "dist"
app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

@app.get("/")
async def spa_handler():
    return FileResponse(os.path.join(dist_dir, "index.html"))

