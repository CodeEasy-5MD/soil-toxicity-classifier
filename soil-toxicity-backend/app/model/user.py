# app/model/user.py - Fixed with string reference
from app import db, bcrypt
from datetime import date, datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Use string reference instead of class reference
    # This tells SQLAlchemy to resolve the relationship later
    # soil_samples = db.relationship('Prediction', backref='user', lazy=True)
    
    def __init__(self, username, email, password, phone_number=None):
        self.username = username
        self.email = email
        self.password = password  # Password will be hashed in the controller
        self.phone_number = phone_number

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def __repr__(self):
        return f'<User {self.username}>'