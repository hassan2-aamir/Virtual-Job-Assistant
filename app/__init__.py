from flask_jwt_extended import JWTManager
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config  # Your configuration file
import os

# Initialize the database
db = SQLAlchemy()

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
    jwt = JWTManager(app)

    # Register routes (blueprints)
    from app.routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/users')

    # Add error handling here (optional)
    @app.errorhandler(404)
    def not_found_error(error):
        return {'message': 'Resource not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'message': 'Internal server error'}, 500

    return app
