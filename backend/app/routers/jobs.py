from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from sqlalchemy import text

from .. import models
from ..database import get_db
import json


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
    name_search: str = Query(None, description="Search term"),
    category_search: str = Query(None, description="Category search term"),
    prefered_skill_search: str = Query(None, description="Preferred skill search term"),
    db: Session = Depends(get_db),
):
    

    result = db.execute(text("""
SELECT
    j.id,
    j.name,
    j.description,
    j.category,
    j.cost,
    j.requirements,
    
    -- preferred_skills as JSON array of objects
    COALESCE(
        (
            SELECT json_group_array(
                json_object(
                    'id', s.id,
                    'name', s.name
                )
            )
            FROM json_each(j.preferred_skills) je
            LEFT JOIN skill s ON s.id = je.value
        ),
        '[]'
    ) AS preferred_skills,

    -- reference_letter as JSON object
    CASE
        WHEN ad.id IS NOT NULL THEN json_object(
            'id', ad.id,
            'name', ad.name
        )
        ELSE NULL
    END AS reference_letter_json

FROM job j
LEFT JOIN allData ad ON ad.id = j.reference_letter
                             """)).fetchall()
    

    # do filtering
    if name_search:
        result = [job for job in result if job.name and name_search.lower() in job.name.lower()]
    if category_search:
        result = [job for job in result if job.category and category_search.lower() in job.category.lower()]
    if prefered_skill_search:
        # split by comma and strip whitespace
        search_terms = [term.strip().lower() for term in prefered_skill_search.split(',')]
        print('search_terms:', search_terms)

        # filter jobs where its preferred_skills contains all of search terms
        def job_matches(job):
            if not job.preferred_skills:
                return False
            try:
                skills = json.loads(job.preferred_skills)
            except json.JSONDecodeError:
                return False
            skill_names = {skill['name'].lower() for skill in skills if 'name' in skill and skill['name']}
            return all(term in skill_names for term in search_terms)

        result = [job for job in result if job_matches(job)]



    # Sorting logic
    # reverse = sort_order.lower() == "desc"
    # if sort_by in ['name', 'category']:
    #     result.sort(key=lambda x: (x[sort_by] is None, x[sort_by].lower() if x[sort_by] else ''), reverse=reverse)
    # elif sort_by in ['cost']:
    #     result.sort(key=lambda x: (x[sort_by] is None, x[sort_by] if x[sort_by] is not None else float('-inf')), reverse=reverse)
    # else:
    #     result.sort(key=lambda x: (x[sort_by] is None, x[sort_by] if x[sort_by] is not None else float('-inf')), reverse=reverse)

    # result is a list
    total = len(result  )
    jobs = result[skip : skip + limit]

    # fields to extract
    target_field_list = ['name', 'cost', 'category', ('preferred_skills', json.loads), ('reference_letter', json.loads)]

    # convert each job to dict with only target fields
    ret = []
    for job in jobs:
        ret_obj = {}
        for field in target_field_list:
            if isinstance(field, tuple):
                field_name, transform = field
                value = getattr(job, field_name, None)
                if value is not None:
                    ret_obj[field_name] = transform(value)
            elif isinstance(field, str):
                field_name = field
                value = getattr(job, field_name, None)
                if value is not None:
                    ret_obj[field_name] = value
            else:
                value = getattr(job, field_name, None)
                ret_obj[field_name] = value

        ret.append(ret_obj)

    return {"items": ret, "total": total}


@router.get("/{job_id}", response_model=dict)
def read_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
