from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db


class InstallationEffectResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/installationeffects", tags=["installationeffects"])


@router.get("/", response_model=InstallationEffectResponse)
def read_installationeffects(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, description, scope FROM installationeffect"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
        ]

    if sort_by:
        results.sort(
            key=lambda x: x.get(sort_by) or "",
            reverse=(sort_order.lower() == "desc"),
        )

    total = len(results)
    paginated_results = results[skip : skip + limit]

    items = []
    for row in paginated_results:
        item_dict = dict(row)
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{installationeffect_id}", response_model=dict)
def read_installationeffect(installationeffect_id: int, db: Session = Depends(get_db)):
    return read_installationeffect_core(installationeffect_id, db)


def read_installationeffect_core(installationeffect_id: int, db: Session):
    query = text("SELECT * FROM installationeffect WHERE id = :id")
    result = db.execute(query, {"id": installationeffect_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="InstallationEffect not found")

    ret = dict(result._mapping)

    return ret