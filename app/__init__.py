from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os
from config import Config

# Initialize the database and JWTManager
db = SQLAlchemy()
jwt = JWTManager()  # Initialize the JWTManager separately

def create_app():
    # Create Flask app instance
    app = Flask(__name__)

    # Load configuration from Config class
    app.config.from_object(Config)

    # Additional configuration settings
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your_default_secret_key')  # Default for development

    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)  # Initialize the JWTManager with the Flask app

    # Register blueprints (routes)
    from app.routes.user_routes import user_bp
    from app.server import ai_bp

    app.register_blueprint(user_bp)
    app.register_blueprint(ai_bp)

    # Add error handling here (optional)
    @app.errorhandler(404)
    def not_found_error(error):
        return {'message': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'message': 'Internal server error'}, 500

    return app
