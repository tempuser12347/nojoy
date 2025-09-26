from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/npcs", tags=["npcs"])

@router.get("/land")
async def get_land_npcs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    return db.query(models.LandNPC).offset(skip).limit(limit).all()

@router.get("/cities")
async def get_cities(
    region: str = None,
    culture: str = None,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.City)
    if region:
        query = query.filter(models.City.region == region)
    if culture:
        query = query.filter(models.City.culture == culture)
    return query.offset(skip).limit(limit).all()