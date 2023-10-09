import logging
import os
import telebot
from telebot import TeleBot
from telebot.types import Update

BOT_TOKEN=os.getenv('BOT_TOKEN')
PAYMENT_PROVIDER_TOKEN=os.getenv('PAYMENT_PROVIDER_TOKEN')
WEBHOOK_URL=os.getenv('WEBHOOK_URL')
WEBHOOK_PATH='/bot'

bot = TeleBot(BOT_TOKEN, parse_mode=None)

@bot.message_handler(content_types=['successful_payment'])
def handle_successful_payment(message):
    """Message handler for messages containing 'successful_payment' field.
      This message is sent when the payment is successful and the payment flow is done.
      It's a good place to send the user a purchased item (if it is an electronic item, such as a key) 
      or to send a message that an item is on its way.

      The message param doesn't contain info about ordered good - they should be stored separately.
      Find more info: https://core.telegram.org/bots/api#successfulpayment.

      Example of Successful Payment message:
        {
            "update_id":12345,
            "message":{
                "message_id":12345,
                "date":1441645532,
                "chat":{
                    "last_name":"Doe",
                    "id":123456789,
                    "first_name":"John",
                    "username":"johndoe",
                    "type": ""
                },
                "successful_payment": {
                    "currency": "USD",
                    "total_amount": 1000,
                    "invoice_payload": "order_id",
                    "telegram_payment_charge_id": "12345",
                    "provider_payment_charge_id": "12345",
                    "order_info": {
                        "name": "John"
                    }
                }
            }
        }
    """
    user_name = message.successful_payment.order_info.name
    text = f'Thank you for order, *{user_name}*. This is not a real cafe, so your card was not charged.\nHave a nice day 🙂'
    bot.send_message(
        chat_id=message.chat.id,
        text=text,
        parse_mode='markdown'
    )

@bot.pre_checkout_query_handler(func=lambda _: True)
def handle_pre_checkout_query(pre_checkout_query):
    """Here we may check if ordered items are still available.
      Since this is an example project, all the items are always in stock, so we answer query is OK.
      For other cases, when you perform a check and find out that you can't sell the items,
      you need to answer ok=False.
      Keep in mind: The check operation should not be longer than 10 seconds. If the Telegram API
      doesn't receive answer in 10 seconds, it cancels checkout.
    """
    bot.answer_pre_checkout_query(pre_checkout_query_id=pre_checkout_query.id, ok=True)

def refresh_webhook():
    """Just a wrapper for remove & set webhook ops"""
    bot.remove_webhook()
    bot.set_webhook(WEBHOOK_URL + WEBHOOK_PATH)

def process_update(update_json):
    """Pass received Update JSON to the Bot for processing.
      This method should be typically called from the webhook method.
      
    Args:
        update_json: Update object sent from the Telegram API. See https://core.telegram.org/bots/api#update.
    """
    update = Update.de_json(update_json)
    bot.process_new_updates([update])

def create_invoice_link(prices) -> str:
    """Just a handy wrapper for creating an invoice link for payment. Since this is an example project,
      most of the fields are hardcode.
    """
    return bot.create_invoice_link(
        title='Order #1',
        description='Great choice! Last steps and we will get to cooking ;)',
        payload='orderID',
        provider_token=PAYMENT_PROVIDER_TOKEN,
        currency='USD',
        prices=prices,
        need_name=True,
        need_phone_number=True,
        need_shipping_address=True
    )

def enable_debug_logging():
    """Display all logs from the Bot. May be useful while developing."""
    telebot.logger.setLevel(logging.DEBUG)