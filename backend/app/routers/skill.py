from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class Skill(BaseModel):
    id: int
    name: str
    description: Optional[str]
    type: Optional[str]
    action_point: Optional[str]
    apply_range: Optional[str]
    acquire_cost: Optional[str]
    equip_cost: Optional[str]
    max_rank_adjustment: Optional[str]
    adjutant_position: Optional[str]
    refinement_effect: Optional[dict]
    acquire_requirement: Optional[List[dict]]

    class Config:
        orm_mode = True


class SkillResponse(BaseModel):
    items: List[Skill]
    total: int


router = APIRouter(prefix="/api/skills", tags=["skills"])


@router.get("/", response_model=SkillResponse)
def read_skills(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term for skill name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, type, action_point, apply_range, acquire_cost, equip_cost, max_rank_adjustment, adjutant_position, refinement_effect, acquire_requirement FROM skill"

    where_clauses = []
    params = {}

    if name_search:
        where_clauses.append("name LIKE :name_search")
        params["name_search"] = f"%{name_search}%"

    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)

    # Get total count before pagination
    count_query = f"SELECT COUNT(*) FROM ({query}) as sub"
    total = db.execute(text(count_query), params).scalar()

    # Add sorting
    if sort_by in ["id", "name"]:
        order = "DESC" if sort_order.lower() == "desc" else "ASC"
        query += f" ORDER BY {sort_by} {order}"

    # Add pagination
    query += " LIMIT :limit OFFSET :skip"
    params["limit"] = limit
    params["skip"] = skip

    results = db.execute(text(query), params).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    items = []
    for row in results:
        item_dict = dict(row._mapping)
        for field in ["acquire_requirement", "refinement_effect"]:
            if item_dict.get(field) and isinstance(item_dict[field], str):
                try:
                    item_dict[field] = json.loads(item_dict[field])
                except json.JSONDecodeError:
                    item_dict[field] = None
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{skill_id}", response_model=Skill)
def read_skill(skill_id: int, db: Session = Depends(get_db)):
    return read_skill_core(skill_id, db)


def read_skill_core(skill_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        text(
            "SELECT id, name, description, type, action_point, apply_range, acquire_cost, equip_cost, max_rank_adjustment, adjutant_position, refinement_effect, acquire_requirement FROM skill WHERE id = :skill_id"
        ),
        {"skill_id": skill_id},
    ).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Skill not found")

    ret = dict(result._mapping)

    # Parse JSON fields
    for field in ["acquire_requirement", "refinement_effect"]:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret
