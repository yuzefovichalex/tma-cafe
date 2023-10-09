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
    user_name = message.successful_payment.order_info.name
    text = f'Thank you for order, *{user_name}*. This is not a real cafe, so your card was not charged.\nHave a nice day 🙂'
    bot.send_message(
        chat_id=message.chat.id,
        text=text,
        parse_mode='markdown'
    )

@bot.pre_checkout_query_handler(func=lambda _: True)
def handle_pre_checkout_query(pre_checkout_query):
    # Here we may check if ordered items are still available.
    # Since this is an example project, all the items are always in stock, so we answer query is OK.
    # For other cases, when you perform a check and find out that you can't sell the items,
    # you need to answer ok=False.
    # Keep in mind: The check operation should not be longer than 10 seconds. If the Telegram API
    # doesn't receive answer in 10 seconds, it cancels checkout.
    bot.answer_pre_checkout_query(pre_checkout_query_id=pre_checkout_query.id, ok=True)

def refresh_webhook():
    bot.remove_webhook()
    bot.set_webhook(WEBHOOK_URL + WEBHOOK_PATH)

def process_update(update_json):
    update = Update.de_json(update_json)
    bot.process_new_updates([update])

def create_invoice_link(prices) -> str:
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
    telebot.logger.setLevel(logging.DEBUG)