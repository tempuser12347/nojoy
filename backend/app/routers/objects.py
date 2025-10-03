from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from .equipment import read_equipment_core
from .discoveries import get_discovery_core
from .certificate import read_certificate_core
from .treasuremaps import read_treasuremap_core
from .tradegoods import read_tradegood_core
from .shipwrecks import read_shipwreck_core
from .jobs import read_job_core
from .recipebook import read_recipebook_core
from .recipes import read_recipe_core
from .cities import read_city_core
from .ships import read_ship_core
from .quests import read_quest_core
from .consumables import read_consumable_core
from .skill import read_skill_core


router = APIRouter(prefix="/api/obj", tags=["objects"])

''' unique category values in allData table
discovery
quest
treasuremap
furniture
ganador
protection
privateFarm
tradeGoods
culture
gradeBonus
gradePerformance
debateCombo
cannon
city
cityNpc
recipe
recipeBook
relic
relicPiece
memorialAlbum
crest
transmutation
treasureMap
studdingSail
aide
ship
shipSkill
shipMaterial
figurehead
installationEffect
consumable
skill
itemEffect
pet
historicalEvent
skillRefinementEffect
dungeon
landNpc
event
portPermit
courtRank
equipment
equippedEffect
ornament
liner
region
job
extraArmor
certificate
shipwreck
tarotCard
technic
treasureHuntTheme
treasureBox
specialEquipment
sellerNpc
field
marineNpc
sea
title

'''
detail_data_fetch_function_dict = {
    "equipment": read_equipment_core,
    "discovery": get_discovery_core,
    'tradeGoods': read_tradegood_core,
    'consumable': read_consumable_core,
    'shipwreck': read_shipwreck_core,
    'job': read_job_core,
    'recipeBook': read_recipebook_core,
    'recipe': read_recipe_core,
    'city': read_city_core,
    'ship': read_ship_core,
    'quest': read_quest_core,
    'certificate': read_certificate_core,
    'treasuremap': read_treasuremap_core,
    'skill': read_skill_core,
}


@router.get("/{obj_id}", response_model=dict)
def read_object(obj_id: int, db: Session = Depends(get_db)):

    # fetch id and type from allData
    result = db.execute(
        text("select id, category from allData where id = :obj_id"), {"obj_id": obj_id}
    ).fetchone()
    if not result:
        print(f"no query result")
        return {"type": None, "data": None}
    print(f"category: {result.category}")
    fetch_fn = detail_data_fetch_function_dict.get(result.category, None)
    if not fetch_fn:
        print(f"no matching fetch fn")
        return {"type": None, "data": None}
    else:
        deatil_data = fetch_fn(obj_id, db)
        print(f"deatil_data: {deatil_data}")
        return {"type": result.category, "data": deatil_data}
