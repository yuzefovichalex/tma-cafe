import json
import os
from . import auth, bot
from dotenv import load_dotenv
from flask import Flask, request
from flask_cors import CORS
from telebot.types import LabeledPrice

# Load environment variables from .env files.
# Typicall environment variables are set on the OS level,
# but for development purposes it may be handy to set them
# in the .env file directly.
load_dotenv()



app = Flask(__name__)
# Handle paths like '/info/' and '/info' as the same.
app.url_map.strict_slashes = False

# List of allowed origins. The production 'APP_URL' is added by default,
# the development `DEV_APP_URL` is added if it and `DEV_MODE` variable is present.
allowed_origins = [os.getenv('APP_URL')]

if os.getenv('DEV_MODE') is not None:
    allowed_origins.append(os.getenv('DEV_APP_URL'))
    bot.enable_debug_logging()
        
CORS(app, origins=list(filter(lambda o: o is not None, allowed_origins)))



@app.route(bot.WEBHOOK_PATH, methods=['POST'])
def bot_webhook():
    """Entry points for Bot update sent via Telegram API.
      You may find more info looking into process_update method.
    """
    bot.process_update(request.get_json())
    return { 'message': 'OK' }
        
@app.route('/info')
def info():
    """API endpoint for providing info about the cafe.
    
    Returns:
      JSON data from data/info.json file or error message with 404 code if not found.
    """
    try:
        return json_data('data/info.json')
    except FileNotFoundError:
        return { 'message': 'Could not find info data.' }, 404

@app.route('/categories')
def categories():
    """API endpoint for providing available cafe categories.
    
    Returns:
      JSON data from data/categories.json file or error message with 404 code if not found.
    """
    try:
        return json_data('data/categories.json')
    except FileNotFoundError:
        return { 'message': 'Could not find categories data.' }, 404

@app.route('/menu/<category_id>')
def category_menu(category_id: str):
    """API endpoint for providing menu list of specified category.
    
    Args:
      category_id: Looking menu category ID.

    Returns:
      JSON data from one of data/menu/<category_id>.json file or error message with 404 code if not found.
    """
    try:
        return json_data(f'data/menu/{category_id}.json')
    except FileNotFoundError:
        return { 'message': f'Could not find `{category_id}` category data.' }, 404

@app.route('/menu/details/<menu_item_id>')
def menu_item_details(menu_item_id: str):
    """API endpoint for providing menu item details.
    
    Args:
      menu_item_id: Looking menu item ID.

    Returns:
      JSON data from one of data/menu/<category_id>.json file or error message with 404 code if not found.
    """
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
    """API endpoint for creating an order. This method performs the following tasks:
        - Validation of the initData received from the Telegram Mini App.
        - Conversion of cart items into LabeledPrice objects for further submitting to Telegram API.
      As a result, we get an invoiceUrl that can be used to start the payment process in our Mini App.
      See: https://core.telegram.org/bots/webapps#initializing-mini-apps (Telegram.WebApp.openInvoice method).
    
      Example of request body:
        {
            "_auth": "<init_data_for_validation>",
            "cartItems": [
                {
                    "cafeItem": {
                        "name": "Burger"
                    },
                    "variant": {
                        "name": "Small",
                        "cost": 100
                    },
                    "quantity": 3
                }
            ]
        }

      Please note: This method is the appropriate place to create an order ID and save it to some persistance storage.
      You can pass it then as invoice_payload parameter when creating invoiceUrl to further update the order status, and,
      after successful payment, get the collected information about the order items (this information is not stored by Telegram).
    """
    request_data = request.get_json()

    auth_data = request_data.get('_auth')
    if auth_data is None or not auth.validate_auth_data(bot.BOT_TOKEN, auth_data):
        return { 'message': 'Request data should contain auth data.' }, 401

    order_items = request_data.get('cartItems')
    if order_items is None:
        return { 'message': 'Cart Items are not provided.' }, 400

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
        prices=labeled_prices
    )

    return { 'invoiceUrl': invoice_url }

def json_data(data_file_path: str):
    """Extracts data from the JSON file.

    Args:
      data_file_path: Path to desired JSON file.

    Returns:
      Data from the desired JSON file (as dict).

    Raises:
      FileNotFoundError if desired file doesn't exist.
    """
    if os.path.exists(data_file_path):
        with open(data_file_path, 'r') as data_file:
            return json.load(data_file)
    else:
        raise FileNotFoundError()
    


bot.refresh_webhook()