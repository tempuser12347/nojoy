from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Set
import json
import asyncio
import os

router = APIRouter()

COMPLETED_FILE = "completed.json"
completed_ids: Set[str] = set()
completed_ids_dirty: bool = False

class CompletedStatusUpdate(BaseModel):
    item_id: int
    is_completed: bool

def load_completed_ids():
    global completed_ids
    if os.path.exists(COMPLETED_FILE):
        with open(COMPLETED_FILE, "r") as f:
            try:
                data = json.load(f)
                completed_ids = set(data.get('completed_ids', []))
            except json.JSONDecodeError:
                completed_ids = set()
    else:
        completed_ids = set()

def save_completed_ids():
    global completed_ids_dirty
    with open(COMPLETED_FILE, "w") as f:
        data = {
            "schema_version": "1.0.0",
            "completed_ids": list(completed_ids)
        }
        # sort the ids before saving for consistency
        data["completed_ids"].sort()
        json.dump(data, f, indent=4, ensure_ascii=False)
    completed_ids_dirty = False

async def save_completed_ids_periodically():
    global completed_ids_dirty
    while True:
        await asyncio.sleep(3)
        if completed_ids_dirty:
            save_completed_ids()

@router.post("/completed")
async def update_completed_status(update: CompletedStatusUpdate):
    global completed_ids_dirty
    if update.is_completed:
        if update.item_id not in completed_ids:
            completed_ids.add(update.item_id)
            completed_ids_dirty = True
    else:
        if update.item_id in completed_ids:
            completed_ids.remove(update.item_id)
            completed_ids_dirty = True
    return {"message": "Completed status updated", "item_id": update.item_id, "is_completed": update.is_completed}

@router.get("/completed")
async def get_completed_ids():
    return list(completed_ids)
