from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/items", tags=["items"])

@router.get("/consumables")
async def get_consumables(
    category: str = None,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.Consumable)
    if category:
        query = query.filter(models.Consumable.category == category)
    return query.offset(skip).limit(limit).all()

@router.get("/equipment")
async def get_equipment(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    query = db.query(models.Item).filter(models.Item.type == "장비품")
    return query.offset(skip).limit(limit).all()

@router.get("/trade")
async def get_trade_items(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    query = db.query(models.Item).filter(models.Item.type == "교역품")
    return query.offset(skip).limit(limit).all()