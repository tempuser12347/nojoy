from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from .. import models
from ..database import get_db
import json

router = APIRouter(prefix="/api/recipes", tags=["recipes"])


@router.get("/", response_model=dict)
def read_recipes(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    search: str = Query(None, description="Search term"),
    required_skills: str = Query(None, description="Required skill"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    # query = db.query(models.Recipe)

    results = db.execute(
        text(
            """ 
SELECT
    id,
    name,
    description,
    recipe_book_id,
    required_Skill,
    ingredients,
    sophia,
    era,
    home_production,
    development,
    Investment_cost,
    central_city,
    Industrial_revolution,
    own_Industrial_city,
    title,
    consumption_contribution,
    other,
    -- replace "ref" with "id" in the JSON string
    REPLACE(success, '"ref"', '"id"') AS success,
    greatsuccess,
    failure
FROM recipe;

"""
        )
    ).fetchall()

    if search:
        results = [row for row in results if search.lower() in (row.name or "").lower()]

    if required_skills:
        term_list = required_skills.split(",")
        # filter rows where row's required_Skill after json parsing and getting each elem's name value, check if name value is in term_list. if so then it remains
        filtered = []
        for row in results:
            a = row.required_Skill

            if not a:
                continue
            if a is None:
                continue
            try:
                a = json.loads(a)
            except Exception as e:
                raise e

            for b in a:
                if b.get("name", None) in term_list:
                    filtered.append(row)
                    break
        results = filtered

    # Sorting
    reverse = sort_order.lower() == "desc"
    if sort_by:
        print(f"sort_by: {sort_by}, sort_order: {sort_order}")
        results.sort(key=lambda r: getattr(r, sort_by) or "", reverse=reverse)

    total = len(results)
    items = results[skip : skip + limit]

    return_fields = [
        "id",
        "name",
        "description",
        "recipe_book_id",
        "required_Skill",
        "ingredients",
        "sophia",
        "era",
        "home_production",
        "development",
        "Investment_cost",
        "central_city",
        "Industrial_revolution",
        "own_Industrial_city",
        "title",
        "consumption_contribution",
        "other",
        "success",
        "greatsuccess",
        "failure",
    ]

    json_parsing_fields = [
        "ingredients",
        "required_Skill",
        "success",
        "greatsuccess",
        "failure",
    ]

    ret_list = []
    for recipe in items:

        ret = {field: getattr(recipe, field) for field in return_fields}
        for field in json_parsing_fields:
            try:
                ret[field] = (
                    json.loads(getattr(recipe, field))
                    if getattr(recipe, field, None)
                    else None
                )
            except json.decoder.JSONDecodeError as e:
                print(f"failed to parse {field}, value: {getattr(recipe, field)}")
                raise e

        ret_list.append(ret)

    return {"items": ret_list, "total": total}


@router.get("/{recipe_id}", response_model=dict)
def read_recipe(recipe_id: int, db: Session = Depends(get_db)):
    return read_recipe_core(recipe_id, db)


def read_recipe_core(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")

    # Return all fields from the Recipe model
    return_fields = [
        "id",
        "name",
        "description",
        "recipe_book_id",
        "required_Skill",
        "ingredients",
        "sophia",
        "era",
        "home_production",
        "development",
        "Investment_cost",
        "central_city",
        "Industrial_revolution",
        "own_Industrial_city",
        "title",
        "consumption_contribution",
        "other",
        "success",
        "greatsuccess",
        "failure",
    ]

    json_parsing_fields = [
        "ingredients",
        "required_Skill",
        "success",
        "greatsuccess",
        "failure",
    ]

    ret = {field: getattr(recipe, field) for field in return_fields}
    for field in json_parsing_fields:
        try:
            ret[field] = json.loads(ret[field]) if ret[field] else None
        except Exception:
            ret[field] = ret[field]

    return ret
