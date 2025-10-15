from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import (
    discoveries,
    ships,
    quests,
    cities,
    recipes,
    shipwrecks,
    treasuremaps,
    consumables,
    jobs,
    equipment,
    tradegoods,
    certificate,
    recipebook,
    objects,
    skill,
    npcsale,
    treasurebox,
    region,
    field,
    sea,
    culture,
    privatefarm,
    nation,
    portpermit,
    landnpc,
    marinenpc,
    ganador,
    citynpc,
    skillrefinementeffect,
)
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
app.include_router(ships.router)
app.include_router(quests.router)
app.include_router(cities.router)
app.include_router(recipes.router)
app.include_router(shipwrecks.router)
app.include_router(treasuremaps.router)
app.include_router(consumables.router)
app.include_router(jobs.router)
app.include_router(equipment.router)
app.include_router(tradegoods.router)
app.include_router(certificate.router)
app.include_router(recipebook.router)
app.include_router(objects.router)
app.include_router(skill.router)
app.include_router(npcsale.router)
app.include_router(treasurebox.router)
app.include_router(region.router)
app.include_router(field.router)
app.include_router(sea.router)
app.include_router(culture.router)
app.include_router(privatefarm.router)
app.include_router(nation.router)
app.include_router(portpermit.router)
app.include_router(landnpc.router)
app.include_router(marinenpc.router)
app.include_router(ganador.router)
app.include_router(citynpc.router)
app.include_router(skillrefinementeffect.router)


dist_dir = "dist"
app.mount(
    "/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets"
)


@app.get("/")
async def spa_handler():
    return FileResponse(os.path.join(dist_dir, "index.html"))
