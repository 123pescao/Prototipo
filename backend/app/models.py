#Database Models Schema
from flask_sqlalchemy import SQLAlchemy
from app import db
from werkzeug.security import generate_password_hash, check_password_hash


#User Model
class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(200), nullable=False)
    password_hash = db.Column(db.String(200), nullable=False) #store hash password
    #set hashed password
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    #check if given password matches stored hash
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

#Website Model
class Website(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.Integer, default=5)

#Metric Model
class Metric(db.Model):
    id =db.Column(db.Integer, primary_key=True)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id'), nullable=False)
    response_time = db.Column(db.Float, nullable=False)
    uptime = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

#Alert Model
class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default="unresolved")
    timestamp = db.Column(db.DateTime, nullable=False)
