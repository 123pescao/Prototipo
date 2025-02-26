import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "This_Is_The_Key")
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "instance", "watchly.db")

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")
    SENDGRID_API_KEY = os.getenv("SENDGRID_DEV_API_KEY")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")