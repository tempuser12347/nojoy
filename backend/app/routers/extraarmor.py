from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
from ..common import fetch_all_obtain_methods

class ExtraArmorResponse(BaseModel):
    items: List[dict]
    total: int

router = APIRouter(prefix="/api/extraarmors", tags=["extraarmors"])

@router.get("/", response_model=ExtraArmorResponse)
def read_extraarmors(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, durability, armor, speed, features FROM extraarmor"
    results = db.execute(text(query)).fetchall()

    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
        ]

    if sort_by:
        if sort_by in ['durability', 'armor', 'speed']:
            key_f = lambda x: x.get(sort_by) if x.get(sort_by) is not None else float('-inf')
        else:
            key_f = lambda x: x.get(sort_by, '') if x.get(sort_by) is not None else ''
        results.sort(
            key=key_f,
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    return {"items": paginated_results, "total": total}

@router.get("/{extraarmor_id}", response_model=dict)
def read_extraarmor(extraarmor_id: int, db: Session = Depends(get_db)):
    return read_extraarmor_core(extraarmor_id, db)

def read_extraarmor_core(extraarmor_id: int, db: Session):
    query = text("SELECT * FROM extraarmor WHERE id = :id")
    result = db.execute(query, {"id": extraarmor_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="ExtraArmor not found")
    ret = dict(result._mapping)
    obtain_method_list = fetch_all_obtain_methods(extraarmor_id, db)
    if obtain_method_list:
        ret["obtain_method"] = obtain_method_list

    return ret
