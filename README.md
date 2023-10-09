# Laurel Cafe (Telegram Mini App)

Laurel Cafe is an imaginary cafe that runs on Telegram as a Mini App. This project shows the concept of how to build a web application and integrate it into Telegram.

## Project structure

The project consists of two modules: **backend** and **frontend**. This means that the project includes all the necessary code to run the app by yourself. The code in each of modules includes documentation describing the purpose and/or principle of operation of a particular method. In this *README* we will focus on the main concepts, while you can deep dive to the project by reading the source files.

### Backend

Backend provides data displayed in the application, such as cafe information or a list of menu categories, and also acts as middleware for interacting with Telegram API (handling events, sending messages and more).

#### Technologies

The backend is written in **Python** (*3.11* was used for development and deploy). For the most part, the standard set of tools is used, but the project includes some third-party libraries, including:
- [**Flask**](https://pypi.org/project/Flask/) - Lightweight WSGI web application micro-framework. Used for creating API for both app data (e.g. menu data) and Telegram Bot webhook handling.
- [**Flask-CORS**](https://pypi.org/project/Flask-Cors/) - A Flask extension for handling Cross Origin Resource Sharing (CORS), making cross-origin AJAX possible. It's used as a development dependency.
- [**pyTelegramBotAPI**](https://pypi.org/project/pyTelegramBotAPI/) - Python implementation for the Telegram Bot API.
- [**python-dotenv**](https://pypi.org/project/python-dotenv/) - Reads key-value pairs from a .env file and can set them as environment variables. Allows to set environment variables for development without setting them in OS directly.

#### Project structure

The backend folder includes two subfolders: **app** and **data**.

**app** folder contains the following Python files:
- `auth.py` - Mini App user validation.
- `bot.py` - Initialization and interaction with bot.
- `main.py` - Entry point. Includes Flask initialization and configuration, as well as supported API endpoints, including bot webhook.

**data** folder сontains JSON files with data that is returned by the corresponding API requests.

#### Running locally

To test the changes you have made to the backend code and/or the data, or just simply play with it you can deploy the backend locally.

If this is your first time after you cloned the project, you need to start with initialization of [**venv**](https://code.visualstudio.com/docs/python/environments) (Python Virtual Environment):

```shell
cd backend
python -m venv .venv
source .venv/bin/activate # For Linux/MacOS
.venv/Scripts/Activate.ps1 # For Windows
```

When you activated the environment, you need to install all the dependencies:

```shell
pip install -r requirements.txt
```

Now you are ready to start the development server:

```shell
flask --app app.main:app run
```

You will see in your console something like that:

```shell
 * Serving Flask app 'app.main:app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

Here you can see the address where you can reach your API. *Memorize it, you will need it when working with the frontend part.*

#### Production deploy

Since the project uses Flask, you will need a WSGI server to deploy to production. You can find some examples below.

##### Phusion Passenger

Current production version of Laurel Cafe Mini App works on [**Phusion Passenger**](https://www.phusionpassenger.com/) in combination with **cPanel**. To run the project in this combination, in the project root (**backend** folder) you need to create a file `passenger_wsgi.py` with the following contents:

```python
from app.main import app as application
```

Then create a Python application in cPanel and specify the following params:
- *Application startup file* - `passenger_wsgi.py`
- *Application Entry point* - `application`

##### Vercel

[**Vercel**](https://vercel.com/) provides possibility to run Python project using Serverless Functions. To do so create in the project root (**backend** folder) the `vercel.json` file:

```json
{
    "builds": [
        {
            "src": "/app/main.py",
            "use": "@vercel/python"
        }
    ],
    "routes": [
        {
            "src": "/(.*)",
            "dest": "/app/main.py"
        }
    ]
}
```

Then follow the Vercel's [instructions](https://vercel.com/docs/functions/serverless-functions/runtimes/python#web-server-gateway-interface) to deploy the app.

### Frontend

