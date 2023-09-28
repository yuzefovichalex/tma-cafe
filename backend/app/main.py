import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    'http://127.0.0.1:5500'
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
async def root():
    return { 'message': 'OK' }

@app.get('/api/info')
async def info():
    try:
        return json_data('data/info.json')
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail='Could not find info data.')

@app.get('/api/categories')
async def categories():
    try:
        return json_data('data/categories.json')
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail='Could not find categories data.')

@app.get('/api/menu/{category_id}')
async def menu(category_id: str):
    try:
        return json_data(f'data/menu/{category_id}.json')
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail='Could not popular menu section data.')

def json_data(data_file_path: str):
    if os.path.exists(data_file_path):
        with open(data_file_path, 'r') as data_file:
            return json.load(data_file)
    else:
        raise FileNotFoundError()
