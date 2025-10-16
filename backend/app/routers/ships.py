from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from app.database import get_db
from app import models
from ..common import fetch_all_obtain_methods


router = APIRouter(prefix="/api/ships", tags=["ships"])


@router.get("/", response_model=Dict[str, Any])
def read_ships(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term for ship name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Ship)

    if name_search:
        query = query.filter(models.Ship.name.ilike(f"%{name_search}%"))

    total = query.count()

    if hasattr(models.Ship, sort_by):
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_by))
        else:
            query = query.order_by(desc(sort_by))

    ships = query.offset(skip).limit(limit).all()

    return_fields = [
        "id",
        "name",
        "type",
        "size",
        "category",
        "lv_adventure",
        "lv_trade",
        "lv_battle",
        "durability",
        "vertical_sail",
        "horizontal_sail",
        "rowing_power",
        "turning_performance",
        "wave_resistance",
        "armor",
        "cabin_capacity",
        "required_crew",
        "cannon_chambers",
        "warehouse_capacity",
    ]

    ret_list = []
    for ship in ships:
        ret = {field: getattr(ship, field) for field in return_fields}
        ret_list.append(ret)

    return {"items": ret_list, "total": total}


@router.get("/{ship_id}", response_model=dict)
def read_ship(ship_id: int, db: Session = Depends(get_db)):
    return read_ship_core(ship_id, db)


def read_ship_core(ship_id: int, db: Session = Depends(get_db)):
    ship = db.query(models.Ship).filter(models.Ship.id == ship_id).first()
    if ship is None:
        raise HTTPException(status_code=404, detail="Ship not found")

    return_fields = [
        "id",
        "name",
        "additional_name",
        "description",
        "type",
        "size",
        "category",
        "lv_adventure",
        "lv_trade",
        "lv_battle",
        "default_material",
        "base_reinforcement",
        "re_reinforcement",
        "shipbuilding",
        "dry_days",
        "city_progress",
        "city_invest",
        "durability",
        "vertical_sail",
        "horizontal_sail",
        "rowing_power",
        "turning_performance",
        "wave_resistance",
        "armor",
        "cabin_capacity",
        "required_crew",
        "cannon_chambers",
        "warehouse_capacity",
        "durability_plus",
        "vertical_sail_plus",
        "horizontal_sail_plus",
        "rowing_power_plus",
        "turning_performance_plus",
        "wave_resistance_plus",
        "armor_plus",
        "cabin_capacity_plus",
        "cannon_chambers_plus",
        "warehouse_capacity_plus",
        "auxiliary_sails",
        "figurehead",
        "crest",
        "special_equipment",
        "additional_armor",
        "broadside_ports",
        "bow_ports",
        "stern_ports",
    ]

    ret = {field: getattr(ship, field) for field in return_fields}

    obtm_list = fetch_all_obtain_methods(ship_id, db)
    ret["obtain_method"] = obtm_list

    return ret
