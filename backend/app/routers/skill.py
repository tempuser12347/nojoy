from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db


class Skill(BaseModel):
    id: int
    name: str

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
    query = "SELECT id, name FROM skill"

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

    return {"items": results, "total": total}


@router.get("/{skill_id}", response_model=Skill)
def read_skill(skill_id: int, db: Session = Depends(get_db)):
    return read_skill_core(skill_id, db)


def read_skill_core(skill_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("SELECT id, name FROM skill WHERE id = :skill_id"),
        {"skill_id": skill_id},
    ).fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    # convert to dict
    result = {
        "id": result.id,
        "name": result.name,
    }

    return result
