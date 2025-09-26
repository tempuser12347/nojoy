from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
import json

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

@router.get("/", response_model=List[dict])
def read_recipes(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    search: str = Query(None, description="Search term"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Recipe)
    
    if search:
        query = query.filter(models.Recipe.name.ilike(f"%{search}%"))
    
    recipes = query.offset(skip).limit(limit).all()
    
    return_fields = [
        "id", "name", "description", "recipe_book_id", "required_Skill",
        "ingredients", "sophia", "era", "home_production", "development",
        "Investment_cost", "central_city", "Industrial_revolution",
        "own_Industrial_city", "title", "consumption_contribution",
        "other", "success", "greatsuccess", "failure"
    ]

    json_parsing_fields = ["ingredients", "required_Skill",  "success", "greatsuccess", "failure"]

    ret_list = []
    for recipe in recipes:

        ret = {field: getattr(recipe, field) for field in return_fields}
        for field in json_parsing_fields:
            try:
                ret[field] = json.loads(ret[field]) if ret[field] else None
            except Exception:
                ret[field] = ret[field] 
        
        ret_list.append(ret)

    return ret_list

@router.get("/{recipe_id}", response_model=dict)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    # Return all fields from the Recipe model
    return_fields = [
        "id", "name", "description", "recipe_book_id", "required_Skill",
        "ingredients", "sophia", "era", "home_production", "development",
        "Investment_cost", "central_city", "Industrial_revolution",
        "own_Industrial_city", "title", "consumption_contribution",
        "other", "success", "greatsuccess", "failure"
    ]

    json_parsing_fields = ["ingredients", "required_Skill",  "success", "greatsuccess", "failure"]
    
    ret = {field: getattr(recipe, field) for field in return_fields}
    for field in json_parsing_fields:
        try:
            ret[field] = json.loads(ret[field]) if ret[field] else None
        except Exception:
            ret[field] = ret[field] 

    return ret