from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text
from ..database import get_db


class CertificateResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/certificates", tags=["certificates"])


@router.get("/", response_model=CertificateResponse)
def read_certificates(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    name_search: str = Query(None, description="Search term for name"),
    classification_search: str = Query(
        None, description="Search term for classification"
    ),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    results = db.execute(text("SELECT * FROM certificate")).fetchall()

    if name_search:
        results = [
            row for row in results if name_search.lower() in (row.name or "").lower()
        ]

    if classification_search:
        results = [
            row
            for row in results
            if classification_search.lower() in (row.classification or "").lower()
        ]

    # Sorting logic
    if results:
        reverse = sort_order.lower() == "desc"

        def sort_key(row):
            value = getattr(row, sort_by, None)
            if value is None:
                return (
                    0
                    if isinstance(getattr(results[0], sort_by, None), (int, float))
                    else ""
                )
            return value

        results.sort(key=sort_key, reverse=reverse)

    total = len(results)
    certs = results[skip : skip + limit]

    ret_list = [
        {
            "id": row.id,
            "name": row.name,
            "description": row.description,
            "classification": row.classification,
        }
        for row in certs
    ]

    return {"items": ret_list, "total": total}


@router.get("/{cert_id}", response_model=dict)
def read_certificate(cert_id: int, db: Session = Depends(get_db)):
    return read_certificate_core(cert_id, db)


def read_certificate_core(cert_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("SELECT * FROM certificate WHERE id = :cert_id"),
        {"cert_id": cert_id},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Certificate not found")

    return {
        "id": result.id,
        "name": result.name,
        "description": result.description,
        "classification": result.classification,
    }
