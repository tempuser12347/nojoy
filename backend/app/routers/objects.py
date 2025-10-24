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
from .npcsale import read_npcsale_core
from .region import get_region_core
from .treasurebox import read_treasurebox_core
from .field import read_field_core
from .sea import read_sea_core
from .culture import read_culture_core
from .privatefarm import read_privatefarm_core
from .nation import read_nation_core
from .portpermit import read_portpermit_core
from .landnpc import read_landnpc_core
from .marinenpc import read_marinenpc_core
from .ganador import read_ganador_core
from .citynpc import read_citynpc_core
from .skillrefinementeffect import read_skillrefinementeffect_core
from .research import read_research_core
from .major import read_major_core
from .researchaction import read_researchaction_core
from .technique import read_technique_core
from .title import read_title_core
from .courtrank import read_courtrank_core
from .aide import read_aide_core
from .pet import read_pet_core
from .shipmaterial import read_shipmaterial_core
from .shipskill import read_shipskill_core
from .shipbasematerial import read_shipbasematerial_core
from .gradeperformance import read_gradeperformance_core
from .gradebonus import read_gradebonus_core
from .cannon import read_cannon_core
from .studdingsail import read_studdingsail_core
from .figurehead import read_figurehead_core
from .extraarmor import read_extraarmor_core
from .specialequipment import read_specialequipment_core
from .sailorequipment import read_sailorequipment_core
from .crest import read_crest_core
from .shipdecor import read_shipdecor_core
from .furniture import read_furniture_core
from .ornament import read_ornament_core


router = APIRouter(prefix="/api/obj", tags=["objects"])

""" unique category values in allData table
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

"""
detail_data_fetch_function_dict = {
    "equipment": read_equipment_core,
    "discovery": get_discovery_core,
    "tradegoods": read_tradegood_core,
    "consumable": read_consumable_core,
    "shipwreck": read_shipwreck_core,
    "job": read_job_core,
    "recipebook": read_recipebook_core,
    "recipe": read_recipe_core,
    "city": read_city_core,
    "ship": read_ship_core,
    "quest": read_quest_core,
    "certificate": read_certificate_core,
    "treasuremap": read_treasuremap_core,
    "skill": read_skill_core,
    "sellernpc": read_npcsale_core,
    "region": get_region_core,
    "treasurebox": read_treasurebox_core,
    "field": read_field_core,
    "sea": read_sea_core,
    "culture": read_culture_core,
    "privatefarm": read_privatefarm_core,
    "nation": read_nation_core,
    "portpermit": read_portpermit_core,
    "landnpc": read_landnpc_core,
    "marinenpc": read_marinenpc_core,
    "ganador": read_ganador_core,
    "citynpc": read_citynpc_core,
    "skillrefinementeffect": read_skillrefinementeffect_core,
    "research": read_research_core,
    "major": read_major_core,
    "researchaction": read_researchaction_core,
    "technique": read_technique_core,
    "title": read_title_core,
    "courtrank": read_courtrank_core,
    "aide": read_aide_core,
    "pet": read_pet_core,
    "shipmaterial": read_shipmaterial_core,
    "shipskill": read_shipskill_core,
    "shipbasematerial": read_shipbasematerial_core,
    "gradeperformance": read_gradeperformance_core,
    "gradebonus": read_gradebonus_core,
    "cannon": read_cannon_core,
    "studdingsail": read_studdingsail_core,
    "figurehead": read_figurehead_core,
    "extraarmor": read_extraarmor_core,
    "specialequipment": read_specialequipment_core,
    "sailorequipment": read_sailorequipment_core,
    "crest": read_crest_core,
    "shipdecor": read_shipdecor_core,
    "furniture": read_furniture_core,
    "ornament": read_ornament_core,
}


@router.get("/{obj_id}", response_model=dict)
def read_object(obj_id: int, db: Session = Depends(get_db)):

    # fetch id and type from allData
    result = db.execute(
        text("select id, category from allData where id = :obj_id"), {"obj_id": obj_id}
    ).fetchone()
    if not result:
        print(f"no query result")
        return {"type": None, "data": None, "msg": "not in allData"}
    print(f"category: {result.category}")
    fetch_fn = detail_data_fetch_function_dict.get(result.category, None)
    if not fetch_fn:
        print(f"no matching fetch fn")
        return {"type": None, "data": None, "msg": "no detail found"}
    else:
        deatil_data = fetch_fn(obj_id, db)
        print(f"deatil_data: {deatil_data}")
        return {"type": result.category, "data": deatil_data}
