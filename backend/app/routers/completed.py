from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, List, Any
import json
import asyncio
import os
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

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

class NameList(BaseModel):
    names: str

class CompletedItem(BaseModel):
    id: int
    name: str

class AddCompletedItems(BaseModel):
    items: List[CompletedItem]

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

@router.post("/completed/check_names")
async def check_names(namelist: NameList, db: Session = Depends(get_db)):
    names = namelist.names
    name_list = names.split('\n')
    name_list = [name.strip() for name in name_list if name.strip()]
    name_list = [a for a in name_list if a!='']
    names = name_list
    
    matched_items = []
    error_names = []
    
    for name in names:
        result = db.execute(text("SELECT id, category FROM allData WHERE name = :name"), {"name": name}).fetchall()
        
        if not result:
            error_names.append(name)
            continue
        
        discovery_item = None
        if len(result) > 1:
            for row in result:
                if row[1] == 'discovery':
                    discovery_item = (row[0], name)
                    break
            if not discovery_item:
                error_names.append(name)
                continue
        else:
            if result[0][1] == 'discovery':
                discovery_item = (result[0][0], name)
            else:
                error_names.append(name)
                continue
        
        if discovery_item:
            matched_items.append({"id": discovery_item[0], "name": discovery_item[1]})
            
    return {
        "match_count": len(matched_items),
        "error_count": len(error_names),
        "matched_items": matched_items,
        "error_names": error_names
    }

@router.post("/completed/add_many")
async def add_many_completed(items_to_add: AddCompletedItems):
    global completed_data_dirty
    for item in items_to_add.items:
        if completed_data.get(item.id) != item.name:
            completed_data[item.id] = item.name
            completed_data_dirty = True
    return {"message": f"{len(items_to_add.items)} items added to completed list."}


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


