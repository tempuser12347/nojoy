from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
import json

router = APIRouter(prefix="/api/shipwrecks", tags=["shipwrecks"])

@router.get("/", response_model=List[dict])
def read_shipwrecks(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    search: str = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Shipwreck)
    
    if search:
        query = query.filter(models.Shipwreck.name.ilike(f"%{search}%"))
    
    shipwrecks = query.offset(skip).limit(limit).all()
    
    return_fields = [
        "id", "type", "name", "explanation", "difficulty", "sea_area",
        "destination", "discovery_coordinates", "skill", "characteristics",
        "discovery", "consumables", "trade_goods", "equipment", "recipebook",
        "aux_sail", "ship_material", "cannon", "special_equipment",
        "additional_armor", "figurehead", "emblem", "ship_decoration",
        "consumable_code", "trade_goods_code", "equipment_code",
        "recipe_book_code", "aux_sail_code", "ship_material_code",
        "cannon_code", "special_equipment_code", "additional_armor_code",
        "figurehead_code", "emblem_code", "ship_decoration_code", "item_id"
    ]

    ret_list = []
    for shipwreck in shipwrecks:
        ret = {field: getattr(shipwreck, field) for field in return_fields}
        ret_list.append(ret)

    return ret_list

@router.get("/{shipwreck_id}", response_model=dict)
def read_shipwreck(shipwreck_id: int, db: Session = Depends(get_db)):
    shipwreck = db.query(models.Shipwreck).filter(models.Shipwreck.id == shipwreck_id).first()
    if shipwreck is None:
        raise HTTPException(status_code=404, detail="Shipwreck not found")
    
    return_fields = [
        "id", "type", "name", "explanation", "difficulty", "sea_area",
        "destination", "discovery_coordinates", "skill", "characteristics",
        "discovery", "consumables", "trade_goods", "equipment", "recipebook",
        "aux_sail", "ship_material", "cannon", "special_equipment",
        "additional_armor", "figurehead", "emblem", "ship_decoration",
        "consumable_code", "trade_goods_code", "equipment_code",
        "recipe_book_code", "aux_sail_code", "ship_material_code",
        "cannon_code", "special_equipment_code", "additional_armor_code",
        "figurehead_code", "emblem_code", "ship_decoration_code", "item_id"
    ]
    
    ret = {field: getattr(shipwreck, field) for field in return_fields}
    return ret