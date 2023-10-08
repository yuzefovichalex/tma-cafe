import flask
import json
import logging
import os
import telebot
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from telebot.types import LabeledPrice, PreCheckoutQuery, Update, SuccessfulPayment, Message

load_dotenv()

BOT_TOKEN=os.getenv('BOT_TOKEN')
PAYMENT_PROVIDER_TOKEN=os.getenv('PAYMENT_PROVIDER_TOKEN')
WEBHOOK_URL=os.getenv('WEBHOOK_URL')
WEBHOOK_PATH='/bot'

app = Flask(__name__)
app.url_map.strict_slashes = False

if os.getenv('DEV_MODE') is not None:
    CORS(app, origins=['http://127.0.0.1:5500'])

bot = telebot.TeleBot(BOT_TOKEN, parse_mode=None)

logger = telebot.logger
telebot.logger.setLevel(logging.DEBUG)

@app.route(WEBHOOK_PATH, methods=['POST'])
def bot_webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = Update.de_json(json_string)
        bot.process_new_updates([update])
        return ''
    else:
        flask.abort(403)

@bot.message_handler(content_types=['successful_payment'])
def handle_successful_payment(message):
    bot.send_message(message.chat.id, 'You have successfully ordered from Laurel Cafe! Do not worry, your card was not charged ;)')

@bot.pre_checkout_query_handler(func=lambda _: True)
def handle_pre_checkout_query(pre_checkout_query):
    # Here we may check if ordered items are still available.
    # Since this is an example project, all the items are always in stock, so we answer query is OK.
    # For other cases, when you perform a check and find out that you can't sell the items,
    # you need to answer ok=False.
    # Keep in mind: The check operation should not be longer than 10 seconds. If the Telegram API
    # doesn't receive answer in 10 seconds, it cancels checkout.
    bot.answer_pre_checkout_query(pre_checkout_query_id=pre_checkout_query.id, ok=True)


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
    order_items = request.get_json()

    labeled_prices = []
    for order_item in order_items:
        name = order_item['cafeItem']['name']
        variant = order_item['variant']['name']
        cost = order_item['variant']['cost']
        quantity = order_item['quantity']
        price = int(cost) * int(quantity)
        labeled_price = LabeledPrice(
            label=f'{name} ({variant}) x{quantity}',
            amount=price
        )
        labeled_prices.append(labeled_price)

    invoice_url = bot.create_invoice_link(
        title='Order #1',
        description='Great choice! Last steps and we will get to cooking ;)',
        payload='orderID',
        provider_token=PAYMENT_PROVIDER_TOKEN,
        currency='USD',
        prices=labeled_prices,
        need_name=True,
        need_phone_number=True,
        need_shipping_address=True
    )

    return { 'invoiceUrl': invoice_url }

def json_data(data_file_path: str):
    if os.path.exists(data_file_path):
        with open(data_file_path, 'r') as data_file:
            return json.load(data_file)
    else:
        raise FileNotFoundError()

bot.remove_webhook()
bot.set_webhook(WEBHOOK_URL + WEBHOOK_PATH)