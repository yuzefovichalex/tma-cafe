import asyncio
import json
import logging
import os
from aiogram import Bot
from aiogram.types.labeled_price import LabeledPrice
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models.order import Order

load_dotenv()

BOT_TOKEN=os.getenv('BOT_TOKEN')
PAYMENT_PROVIDER_TOKEN=os.getenv('PAYMENT_PROVIDER_TOKEN')

logging.basicConfig(level=logging.INFO)

_bot = None

async def get_bot():
    global _bot
    lock = asyncio.Lock()
    await lock.acquire()
    if _bot is None:
        _bot = Bot(BOT_TOKEN)
    lock.release()
    return _bot

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info('Server started')
    yield
    bot = await get_bot()
    await bot.session.close()
    logging.info('Server stopped')

app = FastAPI(lifespan=lifespan)

origins = [
    'http://localhost:8888'
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
        raise HTTPException(status_code=404, detail='Could not find info data.')

@app.get('/api/categories')
async def categories():
    try:
        return json_data('data/categories.json')
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='Could not find categories data.')

@app.get('/api/menu/{category_id}')
async def category_menu(category_id: str):
    try:
        return json_data(f'data/menu/{category_id}.json')
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f'Could not find `{category_id}` category data.')

@app.get('/api/menu/details/{menu_item_id}')
async def menu_item_details(menu_item_id: str):
    try:
        data_folder_path = 'data/menu'
        for data_file in os.listdir(data_folder_path):
            menu_items = json_data(f'{data_folder_path}/{data_file}')
            desired_menu_item = next((menu_item for menu_item in menu_items if menu_item['id'] == menu_item_id), None)
            if desired_menu_item is not None:
                return desired_menu_item
        raise HTTPException(status_code=404, detail=f'Could not menu item data with `{menu_item_id}` ID.')
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f'Could not menu item data with `{menu_item_id}` ID.')

@app.post('/api/order')
async def create_order(order: Order):
    labeled_prices = []
    for order_item in order.items:
        labeled_price = LabeledPrice(
            label='Test product',
            amount=200
        )
        labeled_prices.append(labeled_price)

    bot = await get_bot()
    invoice_url = await bot.create_invoice_link(
        title='Order #1',
        description='Great choice! Last steps and we will get to cooking ;)',
        payload='orderID',
        provider_token=PAYMENT_PROVIDER_TOKEN,
        currency='USD',
        prices=labeled_prices
    )

    return { 'invoiceUrl': invoice_url }

def json_data(data_file_path: str):
    if os.path.exists(data_file_path):
        with open(data_file_path, 'r') as data_file:
            return json.load(data_file)
    else:
        raise FileNotFoundError()
