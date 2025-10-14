from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from ..database import get_db
from ..common import fetch_all_obtain_methods

router = APIRouter(prefix="/api/recipebooks", tags=["recipebooks"])


class RecipeBookResponse(BaseModel):
    items: List[dict]
    total: int


# -------------------------------
# List endpoint
# -------------------------------
@router.get("/", response_model=RecipeBookResponse)
def read_recipebooks(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term in name or additionalname"),
    skills_search: str = Query(None, description="Search term in skills"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT * FROM recipebook"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering
    results = [dict(row._mapping) for row in results]

    # Filtering
    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
            or name_search.lower() in (row.get("additionalname") or "").lower()
        ]

    if skills_search:
        term_list = skills_search.split(",")
        # if row's 'sveries' field is in term_list then include. otherwise exclude
        results = [row for row in results if row.get("sveries") in term_list]

    # Sorting
    reverse = sort_order.lower() == "desc"
    if results and sort_by in results[0]:
        results.sort(key=lambda r: r.get(sort_by) or "", reverse=reverse)

    total = len(results)
    items = results[skip : skip + limit]

    # convert items to list of dict
    fetch_field_list = [
        "id",
        "name",
        "additionalname",
        "description",
        "productionNPC",
        "era",
    ]

    dict_list = []
    for item in items:
        dict_item = {}
        for field in fetch_field_list:
            dict_item[field] = item.get(field)
        dict_item["skill"] = item.get("sveries")
        dict_list.append(dict_item)

    return {"items": dict_list, "total": total}


# -------------------------------
# Detail endpoint
# -------------------------------
@router.get("/{recipebook_id}", response_model=dict)
def read_recipebook(recipebook_id: int, db: Session = Depends(get_db)):
    return read_recipebook_core(recipebook_id, db)


def read_recipebook_core(recipebook_id: int, db: Session = Depends(get_db)):
    query = "SELECT * FROM recipebook WHERE id = :id"
    result = db.execute(text(query), {"id": recipebook_id}).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Recipebook not found")

    fetch_field_list = [
        "id",
        "name",
        "additionalname",
        "description",
        "productionNPC",
        "era",
    ]

    ret = {}
    for field in fetch_field_list:
        ret[field] = getattr(result, field, None)

    ret["skill"] = result.sveries

    obtm_list = fetch_all_obtain_methods(recipebook_id, db)
    ret["obtain_method"] = obtm_list

    # Fetch associated recipes
    recipes_query = "SELECT id, name, required_Skill, ingredients, success FROM recipe WHERE recipe_book_id = :recipebook_id"
    recipes_results = db.execute(text(recipes_query), {"recipebook_id": recipebook_id}).fetchall()
    
    recipes_list = []
    for recipe_row in recipes_results:
        recipes_list.append({
            "id": recipe_row.id,
            "name": recipe_row.name,
            "required_Skill": recipe_row.required_Skill,
            "ingredients": recipe_row.ingredients,
            "output": recipe_row.success
        })
    ret["recipes"] = recipes_list

    return ret
