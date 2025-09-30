from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/treasuremaps", tags=["treasuremaps"])

@router.get("/", response_model=Dict[str, Any])
def read_treasuremaps(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term for treasure map name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db)
):
    query = db.query(models.TreasureMap)
    
    if name_search:
        query = query.filter(models.TreasureMap.name.ilike(f"%{name_search}%"))
    
    total = query.count()

    if hasattr(models.TreasureMap, sort_by):
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_by))
        else:
            query = query.order_by(desc(sort_by))

    treasure_maps = query.offset(skip).limit(limit).all()
    
    return_fields = [
        'id', 'name', 'description','category', 'required_skill',
        'academic_field', 'library', 'destination', 'discovery',
        'city_conditions', 'preceding', 'reward_dukat', 'reward_item',
        'strategy'
    ]

    ret_list = []
    for treasure_map in treasure_maps:
        ret = {field: getattr(treasure_map, field, None) for field in return_fields}
        ret_list.append(ret)

    return {"items": ret_list, "total": total}

@router.get("/{treasuremap_id}", response_model=dict)
def read_treasuremap(treasuremap_id: int, db: Session = Depends(get_db)):
    treasure_map = db.query(models.TreasureMap).filter(models.TreasureMap.id == treasuremap_id).first()
    if treasure_map is None:
        raise HTTPException(status_code=404, detail="TreasureMap not found")
    
    return_fields = [
        'id', 'name', 'description', 'category', 'required_skill',
        'academic_field', 'library', 'destination', 'discovery',
        'city_conditions', 'preceding', 'reward_dukat', 'reward_item',
        'strategy'
    ]
    
    ret = {field: getattr(treasure_map, field, None) for field in return_fields}
    return ret