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
    research,
    major,
    researchaction,
    technique,
    title,
    courtrank,
    aide,
    pet,
    shipmaterial,
    shipskill,
    shipbasematerial,
    gradeperformance,
    gradebonus,
    cannon,
    studdingsail,
    figurehead,
    extraarmor,
    specialequipment,
    sailorequipment,
    crest,
    shipdecor,
    furniture,
    ornament,
    tarotcard,
    transmutation,
    itemeffect,
    equippedeffect,
    protection,
    installationeffect,
    dungeon,
    legacytheme,
    legacy,
    legacyclue,
    treasurehunttheme,
    relic,
    relicpiece)
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
app.include_router(research.router)
app.include_router(major.router)
app.include_router(researchaction.router)
app.include_router(technique.router)
app.include_router(title.router)
app.include_router(courtrank.router)
app.include_router(aide.router)
app.include_router(pet.router)
app.include_router(shipmaterial.router)
app.include_router(shipskill.router)
app.include_router(shipbasematerial.router)
app.include_router(gradeperformance.router)
app.include_router(gradebonus.router)
app.include_router(cannon.router)
app.include_router(studdingsail.router)
app.include_router(figurehead.router)
app.include_router(extraarmor.router)
app.include_router(specialequipment.router)
app.include_router(sailorequipment.router)
app.include_router(crest.router)
app.include_router(shipdecor.router)
app.include_router(furniture.router)
app.include_router(ornament.router)
app.include_router(tarotcard.router)
app.include_router(transmutation.router)
app.include_router(itemeffect.router)
app.include_router(equippedeffect.router)
app.include_router(protection.router)
app.include_router(installationeffect.router)
app.include_router(dungeon.router)
app.include_router(legacytheme.router)
app.include_router(legacy.router)
app.include_router(legacyclue.router)
app.include_router(treasurehunttheme.router)
app.include_router(relic.router)
app.include_router(relicpiece.router)


dist_dir = "dist"
app.mount(
    "/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets"
)


@app.get("/")
async def spa_handler():
    return FileResponse(os.path.join(dist_dir, "index.html"))
