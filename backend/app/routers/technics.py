from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models

router = APIRouter(prefix="/api/technics", tags=["technics"])

@router.get("/")
async def get_technics(
    weapon: str = None,
    type: str = None,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    query = db.query(models.Technic)
    if weapon:
        query = query.filter(models.Technic.weapon == weapon)
    if type:
        query = query.filter(models.Technic.type == type)
    return query.offset(skip).limit(limit).all()