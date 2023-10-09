import hashlib
import hmac
from operator import itemgetter
from urllib.parse import parse_qsl

def validate_auth_data(bot_token: str, auth_data: str) -> bool:
    """Validates initData from the Telegram Mini App.
    You can find more info here: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app.

    Args:
      bot_token: The token you received (will receive) when creating a bot in BotFather.
      auth_data: Chain of all received fields, sorted alphabetically, in the format key=<value> 
        with a line feed character ('\\n', 0x0A) used as separator - 
        e.g., 'auth_date=<auth_date>\\nquery_id=<query_id>\\nuser=<user>'.

    Returns:
      True if the provided auth_data valid, False otherwise.
    """
    try:
        parsed_data = dict(parse_qsl(auth_data, strict_parsing=True))
    except ValueError:
        return False
    
    if "hash" not in parsed_data:
        return False
    hash_ = parsed_data.pop("hash")

    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed_data.items(), key=itemgetter(0))
    )
    secret_key = hmac.new(
        key=b"WebAppData",
        msg=bot_token.encode(),
        digestmod=hashlib.sha256
    )
    calculated_hash = hmac.new(
        key=secret_key.digest(),
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    return calculated_hash == hash_