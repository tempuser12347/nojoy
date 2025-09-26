from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db

router = APIRouter(prefix="/api/cities", tags=["cities"])

@router.get("/", response_model=List[dict])
def read_cities(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    search: str = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    query = db.query(models.City)
    
    if search:
        query = query.filter(models.City.name.ilike(f"%{search}%"))
    
    # total = query.count()
    cities = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": city.id,
            "name": city.name,
            "region": city.region,
            "sea_area": city.sea_area,
            "culture": city.culture,
        }
        for city in cities
    ]

@router.get("/{city_id}", response_model=dict)
def read_city(city_id: int, db: Session = Depends(get_db)):
    city = db.query(models.City).filter(models.City.id == city_id).first()
    if city is None:
        raise HTTPException(status_code=404, detail="City not found")
        
    return_fields = [
        "id", "name", "region", "sea_area", "culture", "language", "description",
        "map_image_point_x", "map_image_point_y", "city_coord_x", "city_coord_y",
        "category", "port_enter_permission", "entry_point", "facility", "investment_amount",
        "investment_reward", "transaction_amount", "transaction_reward", "fishing"
    ]

    return {field: getattr(city, field) for field in return_fields}