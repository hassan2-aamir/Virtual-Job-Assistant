from flask import Flask
from flask_cors import CORS
from config import Config
from app.routes.user_routes import user_bp
from app.server import ai_bp
from app import db  # Import db from the app module


# Initialize the Flask application
app = Flask(__name__)

# Configure the app using Config class
app.config.from_object(Config)

# Bind the db to the app (the initialization is handled in app/__init__.py)
db.init_app(app)

# Debug: Print the SQLALCHEMY_DATABASE_URI
print("SQLALCHEMY_DATABASE_URI:", app.config['SQLALCHEMY_DATABASE_URI'])

# Enable cross-origin requests (CORS)
CORS(app)

# Register blueprints (routes)
app.register_blueprint(user_bp)
app.register_blueprint(ai_bp)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
