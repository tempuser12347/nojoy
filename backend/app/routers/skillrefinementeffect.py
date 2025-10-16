from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db


class SkillRefinementEffect(BaseModel):
    id: int
    name: str
    description: Optional[str]
    action_power: Optional[str]

    class Config:
        orm_mode = True


class SkillRefinementEffectResponse(BaseModel):
    items: List[SkillRefinementEffect]
    total: int


router = APIRouter(
    prefix="/api/skillrefinementeffects", tags=["skillrefinementeffects"]
)


@router.get("/", response_model=SkillRefinementEffectResponse)
def read_skillrefinementeffects(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(None, description="Search term for name"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, action_power FROM skillrefinementeffect"

    where_clauses = []
    params = {}

    if name_search:
        where_clauses.append("name LIKE :name_search")
        params["name_search"] = f"%{name_search}%"

    if where_clauses:
        query += " WHERE " + " AND ".join(where_clauses)

    count_query = f"SELECT COUNT(*) FROM ({query}) as sub"
    total = db.execute(text(count_query), params).scalar()

    if sort_by in ["id", "name", "description", "action_power"]:
        order = "DESC" if sort_order.lower() == "desc" else "ASC"
        query += f" ORDER BY {sort_by} {order}"

    query += " LIMIT :limit OFFSET :skip"
    params["limit"] = limit
    params["skip"] = skip

    results = db.execute(text(query), params).fetchall()
    items = [dict(row._mapping) for row in results]

    return {"items": items, "total": total}


@router.get("/{skillrefinementeffect_id}", response_model=SkillRefinementEffect)
def read_skillrefinementeffect(
    skillrefinementeffect_id: int, db: Session = Depends(get_db)
):
    return read_skillrefinementeffect_core(skillrefinementeffect_id, db)


def read_skillrefinementeffect_core(skillrefinementeffect_id: int, db: Session):
    query = text(
        "SELECT id, name, description, action_power FROM skillrefinementeffect WHERE id = :id"
    )
    result = db.execute(query, {"id": skillrefinementeffect_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="SkillRefinementEffect not found")

    return dict(result._mapping)
