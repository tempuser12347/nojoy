from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from .. import models
from ..database import get_db
import json

router = APIRouter(prefix="/api/shipwrecks", tags=["shipwrecks"])

@router.get("/", response_model=Dict[str, Any])
def read_shipwrecks(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term for shipwreck name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Shipwreck)
    
    if name_search:
        query = query.filter(models.Shipwreck.name.ilike(f"%{name_search}%"))
    
    total = query.count()

    if hasattr(models.Shipwreck, sort_by):
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_by))
        else:
            query = query.order_by(desc(sort_by))

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

    return {"items": ret_list, "total": total}

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