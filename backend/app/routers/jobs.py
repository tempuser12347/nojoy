from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import models
from ..database import get_db


class JobResponse(BaseModel):
    items: List[dict]
    total: int


router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/", response_model=JobResponse)
def read_jobs(
    skip: int = Query(0, description="Skip first N records"),
    limit: int = Query(10, description="Limit the number of records returned"),
    sort_by: str = Query("id", description="Column to sort by"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Job)

    # Sorting logic
    if hasattr(models.Job, sort_by):
        if sort_order.lower() == "desc":
            query = query.order_by(getattr(models.Job, sort_by).desc())
        else:
            query = query.order_by(getattr(models.Job, sort_by).asc())

    total = query.count()
    jobs = query.offset(skip).limit(limit).all()

    return {"items": jobs, "total": total}


@router.get("/{job_id}", response_model=dict)
def read_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
