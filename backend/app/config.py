import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "This_Is_The_Key")

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///watchly.db")
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", True)