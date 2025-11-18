#Database migrations file
# app/__init__.py - Proper CORS configuration
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    load_dotenv()

    # Load config
    app.config.from_pyfile('config.py', silent=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600

    # Disable strict slashes to prevent 308 redirects
    app.url_map.strict_slashes = False
    
    # Initialize database changes and extensions
    db.init_app(app)
    
    # Import models here to avoid circular imports
    from app.model.user import User
    # from app.model.prediction import Prediction  # Uncomment if you have this model
    
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # CORS Configuration - CRITICAL FIX
    CORS(app, 
         origins=["http://localhost:5173", "http://127.0.0.1:5173"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         supports_credentials=True)

    # Add global CORS headers as backup
    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
            response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    # Register blueprints before app initializes
    from app.controller.user_controller import user_bp
    from app.controller.flaskbackend import predict_bp
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(predict_bp, url_prefix='/predict')

    # Test endpoint
    @app.route('/test')
    def test():
        return {'message': 'Server is running and CORS is configured!'}, 200

    return app
