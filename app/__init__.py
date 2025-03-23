from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config  # Import the Config class
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
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # Initialize extensions with app
    db.init_app(app)

    # Register routes (blueprints)
    from app.routes import user_bp
    app.register_blueprint(user_bp, url_prefix='/users')

    return app
