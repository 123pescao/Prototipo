#Database Models Schema
from flask_sqlalchemy import SQLAlchemy
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


#User Model
class User(db.Model):
    __tablename__ = 'user'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable = False)
    email = db.Column(db.String(200), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False) #store hash password
    websites = db.relationship('Website', backref='user', cascade="all, delete", passive_deletes=True, lazy=True)
    #set hashed password
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    #check if given password matches stored hash
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

#Website Model
class Website(db.Model):
    __tablename__ = 'website'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"), nullable=False, index=True)
    url = db.Column(db.String(200), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    frequency = db.Column(db.Integer, default=5)
    metrics = db.relationship('Metric', backref='website', cascade="all, delete", passive_deletes=True)
    alerts = db.relationship('Alert', backref='website', cascade="all, delete", passive_deletes=True)

#Metric Model
class Metric(db.Model):
    id =db.Column(db.Integer, primary_key=True)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id', ondelete="CASCADE"), nullable=False, index=True)
    response_time = db.Column(db.Float, nullable=False)
    uptime = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

#Alert Model
class Alert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    website_id = db.Column(db.Integer, db.ForeignKey('website.id', ondelete="CASCADE"), nullable=False, index=True)
    alert_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default="unresolved")
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
