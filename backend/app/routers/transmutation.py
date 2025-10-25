from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db
import json


class TransmutationResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/transmutations", tags=["transmutations"])


@router.get("/", response_model=TransmutationResponse)
def read_transmutations(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: Optional[str] = Query(
        None, description="Search term for name or extraname"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = "SELECT id, name, extraname, description, base_material, policy, requirements, products FROM transmutation"
    results = db.execute(text(query)).fetchall()

    # Convert Row objects to dict for easier filtering and manipulation
    results = [dict(row._mapping) for row in results]

    if name_search:
        results = [
            row
            for row in results
            if name_search.lower() in (row.get("name") or "").lower()
            or name_search.lower() in (row.get("extraname") or "").lower()
        ]

    # Process requirements and products for display/sorting
    for row in results:
        if row.get("requirements") and isinstance(row["requirements"], str):
            try:
                reqs = json.loads(row["requirements"])
                row["requirements_skill"] = [skill for r in reqs if r["type"] == "스킬" for skill in r["content"]]
                row["requirements_material"] = [material for r in reqs if r["type"] == "재료" for material in r["content"]]
            except json.JSONDecodeError:
                raise Exception()
        if row.get("products") and isinstance(row["products"], str):
            try:
                prods = json.loads(row["products"])
                prod_list = []
                for p in prods:
                    obj = p['product']
                    quantity = p['quantity']
                    obj['quantity'] = quantity
                    prod_list.append(obj)
                row['products'] = prod_list
            except json.JSONDecodeError:
                raise Exception()
        if row.get('base_material'):
            row['base_material'] = json.loads(row['base_material'])

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
        if item_dict.get("extraname"):
            item_dict["name"] = f'{item_dict["name"]} {item_dict["extraname"]}'
        items.append(item_dict)

    return {"items": items, "total": total}


@router.get("/{transmutation_id}", response_model=dict)
def read_transmutation(transmutation_id: int, db: Session = Depends(get_db)):
    return read_transmutation_core(transmutation_id, db)


def read_transmutation_core(transmutation_id: int, db: Session):
    query = text("SELECT * FROM transmutation WHERE id = :id")
    result = db.execute(query, {"id": transmutation_id}).fetchone()

    if result is None:
        raise HTTPException(status_code=404, detail="Transmutation not found")

    ret = dict(result._mapping)

    # Combine name and extraname
    if ret.get("extraname"):
        ret["name"] = f'{ret["name"]} {ret["extraname"]}'

    # Parse JSON fields
    for field in ["requirements", "products", 'base_material']:
        if ret.get(field) and isinstance(ret[field], str):
            try:
                ret[field] = json.loads(ret[field])
            except json.JSONDecodeError:
                ret[field] = None

    return ret