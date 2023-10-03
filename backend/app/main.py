import json
import os
import telebot
from dotenv import load_dotenv
from flask import Flask, request
from telebot.types import LabeledPrice

load_dotenv()

BOT_TOKEN=os.getenv('BOT_TOKEN')
PAYMENT_PROVIDER_TOKEN=os.getenv('PAYMENT_PROVIDER_TOKEN')

app = Flask(__name__)
app.url_map.strict_slashes = False

bot = telebot.TeleBot(BOT_TOKEN, parse_mode=None)

@app.route('/info')
def info():
    try:
        return json_data('data/info.json')
    except FileNotFoundError:
        return { 'message': 'Could not find info data.' }, 404

@app.route('/categories')
def categories():
    try:
        return json_data('data/categories.json')
    except FileNotFoundError:
        return { 'message': 'Could not find categories data.' }, 404

@app.route('/menu/<category_id>')
def category_menu(category_id: str):
    try:
        return json_data(f'data/menu/{category_id}.json')
    except FileNotFoundError:
        return { 'message': f'Could not find `{category_id}` category data.' }, 404

@app.route('/menu/details/<menu_item_id>')
def menu_item_details(menu_item_id: str):
    try:
        data_folder_path = 'data/menu'
        for data_file in os.listdir(data_folder_path):
            menu_items = json_data(f'{data_folder_path}/{data_file}')
            desired_menu_item = next((menu_item for menu_item in menu_items if menu_item['id'] == menu_item_id), None)
            if desired_menu_item is not None:
                return desired_menu_item
        return { 'message': f'Could not menu item data with `{menu_item_id}` ID.' }, 404
    except FileNotFoundError:
        return { 'message': f'Could not menu item data with `{menu_item_id}` ID.' }, 404

@app.route('/order', methods=['POST'])
def create_order():
    order = request.get_json()

    labeled_prices = []
    for order_item in order['items']:
        labeled_price = LabeledPrice(
            label='Test product',
            amount=200
        )
        labeled_prices.append(labeled_price)

    invoice_url = bot.create_invoice_link(
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