from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/discoveries", tags=["discoveries"])

@router.get("/")
async def get_discoveries(
    type: str = None,
    search: str = None,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.Discovery)
    if type:
        query = query.filter(models.Discovery.type == type)
    if search:
        query = query.filter(models.Discovery.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/quests")
async def get_quests(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(models.Quest).offset(skip).limit(limit).all()

@router.get("/treasure-maps")
async def get_treasure_maps(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(models.TreasureMap).offset(skip).limit(limit).all()

@router.get("/shipwrecks")
async def get_shipwrecks(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(models.Shipwreck).offset(skip).limit(limit).all()

@router.get("/{discovery_id}")
async def get_discovery(discovery_id: int, db: Session = Depends(get_db)):
    discovery = db.query(models.Discovery).filter(models.Discovery.id == discovery_id).first()
    if not discovery:
        raise HTTPException(status_code=404, detail="Discovery not found")
    return discovery