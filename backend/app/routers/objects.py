from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from .equipment import read_equipment_core
from .discoveries import get_discovery_core

router = APIRouter(prefix="/api/obj", tags=["objects"])


detail_data_fetch_function_dict = {
    "equipment": read_equipment_core,
    "discovery": get_discovery_core,
}


@router.get("/{obj_id}", response_model=dict)
def read_object(obj_id: int, db: Session = Depends(get_db)):

    # fetch id and type from allData
    result = db.execute(
        text("select id, category from allData where id = :obj_id"), {"obj_id": obj_id}
    ).fetchone()
    if not result:
        print(f"no query result")
        return {"type": None, "data": None}
    print(f"category: {result.category}")
    fetch_fn = detail_data_fetch_function_dict.get(result.category, None)
    if not fetch_fn:
        print(f"no matching fetch fn")
        return {"type": None, "data": None}
    else:
        deatil_data = fetch_fn(obj_id, db)
        print(f"deatil_data: {deatil_data}")
        return {"type": result.category, "data": deatil_data}
