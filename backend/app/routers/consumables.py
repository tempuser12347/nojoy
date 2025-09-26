from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
import json

router = APIRouter(prefix="/api/consumables", tags=["consumables"])

@router.get("/", response_model=List[dict])
def read_consumables(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    search: str = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Consumable)
    
    if search:
        query = query.filter(models.Consumable.name.ilike(f"%{search}%"))
    
    consumables = query.offset(skip).limit(limit).all()
    
    return_fields = [
        "id", "type", "name", "additional_Name", "description", "category",
        "usage_Effect", "features", "Item", "Duplicate"
    ]

    ret_list = []
    for consumable in consumables:
        ret = {field: getattr(consumable, field) for field in return_fields}
        if ret.get("usage_Effect"):
            try:
                ret["usage_Effect"] = json.loads(ret["usage_Effect"])
            except (json.JSONDecodeError, TypeError):
                pass  # Keep as string if not valid JSON
        ret_list.append(ret)

    return ret_list

@router.get("/{consumable_id}", response_model=dict)
def read_consumable(consumable_id: int, db: Session = Depends(get_db)):
    consumable = db.query(models.Consumable).filter(models.Consumable.id == consumable_id).first()
    if consumable is None:
        raise HTTPException(status_code=404, detail="Consumable not found")
    
    return_fields = [
        "id", "type", "name", "additional_Name", "description", "category",
        "usage_Effect", "features", "Item", "Duplicate"
    ]
    
    ret = {field: getattr(consumable, field) for field in return_fields}
    if ret.get("usage_Effect"):
        try:
            ret["usage_Effect"] = json.loads(ret["usage_Effect"])
        except (json.JSONDecodeError, TypeError):
            pass # Keep as string if not valid JSON
    return ret