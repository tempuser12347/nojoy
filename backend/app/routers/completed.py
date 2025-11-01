from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List
import json
import asyncio
import os

router = APIRouter(prefix='/api', tags=['completed'])

COMPLETED_FILE = "completed.json"
# Store as a dictionary {id: name}
completed_data: Dict[int, str] = {}
completed_data_dirty: bool = False

def check_completed_of_id(_id: int) -> bool:
    return _id in completed_data


class CompletedStatusUpdate(BaseModel):
    id: int
    name: str
    is_completed: bool

def load_completed_data():
    global completed_data
    if os.path.exists(COMPLETED_FILE):
        with open(COMPLETED_FILE, "r", encoding='utf-8') as f:
            try:
                data = json.load(f)
                completed_items = data.get('completed_items', [])
                completed_data = {item['id']: item['name'] for item in completed_items}
            except (json.JSONDecodeError, KeyError, TypeError):
                completed_data = {}
    else:
        completed_data = {}

def save_completed_data():
    global completed_data_dirty
    with open(COMPLETED_FILE, "w", encoding='utf-8') as f:
        items_list = [{"id": id, "name": name} for id, name in completed_data.items()]
        items_list.sort(key=lambda x: x['id'])
        
        data = {
            "schema_version": "1.1.0",
            "completed_items": items_list
        }
        json.dump(data, f, indent=4, ensure_ascii=False)
    completed_data_dirty = False

async def save_completed_data_periodically():
    global completed_data_dirty
    while True:
        await asyncio.sleep(3)
        if completed_data_dirty:
            save_completed_data()

@router.post("/completed")
async def update_completed_status(update: CompletedStatusUpdate):
    print(update)
    global completed_data_dirty
    if update.is_completed:
        if completed_data.get(update.id) != update.name:
            completed_data[update.id] = update.name
            completed_data_dirty = True
            print(f'Added/updated id {update.id} with name {update.name}')
        else:
            print(f'id {update.id} already present with the same name.')
    else:
        if update.id in completed_data:
            del completed_data[update.id]
            completed_data_dirty = True
            print(f'removed {update.id} from completed')
        else:
            print(f'{update.id} not in completed')
            
    return {"message": "Completed status updated", "item_id": update.id, "completed": update.is_completed}

@router.get("/completed")
async def get_completed_data():
    items_list = [{"id": id, "name": name} for id, name in completed_data.items()]
    items_list.sort(key=lambda x: x['id'])
    return items_list

