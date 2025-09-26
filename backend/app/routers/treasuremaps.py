from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/treasuremaps", tags=["treasuremaps"])

@router.get("/", response_model=List[dict])
def read_treasuremaps(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    search: str = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    query = db.query(models.TreasureMap)
    
    if search:
        # Assuming TreasureMap model has a 'name' field for searching
        query = query.filter(models.TreasureMap.name.ilike(f"%{search}%"))
    
    treasure_maps = query.offset(skip).limit(limit).all()
    
    return_fields = [
        'id', 'name', 'description','category', 'required_skill', 'cateogry',
        'academic_field', 'library', 'destination', 'discovery',
        'city_conditions', 'preceding', 'reward_dukat', 'reward_item',
        'strategy'
    ]

    ret_list = []
    for treasure_map in treasure_maps:
        ret = {field: getattr(treasure_map, field, None) for field in return_fields}
        ret_list.append(ret)

    return ret_list

@router.get("/{treasuremap_id}", response_model=dict)
def read_treasuremap(treasuremap_id: int, db: Session = Depends(get_db)):
    treasure_map = db.query(models.TreasureMap).filter(models.TreasureMap.id == treasuremap_id).first()
    if treasure_map is None:
        raise HTTPException(status_code=404, detail="TreasureMap not found")
    
    return_fields = [
        'id', 'name', 'description', 'category', 'required_skill', 'cateogry',
        'academic_field', 'library', 'destination', 'discovery',
        'city_conditions', 'preceding', 'reward_dukat', 'reward_item',
        'strategy'
    ]
    
    ret = {field: getattr(treasure_map, field, None) for field in return_fields}
    return ret