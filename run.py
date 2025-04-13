from flask import Flask
from flask_cors import CORS
from config import Config
from app.routes.user_routes import user_bp
from app.server import ai_bp
from app.routes.resume_routes import resume_bp
from app.routes.job_routes import job_bp
from app import db  # Import db from the app module
from flask_jwt_extended import JWTManager
# Add this to run.py
import os



jwt = JWTManager()  # Initialize the JWTManager separately

# Initialize the Flask application
app = Flask(__name__)

# Configure the app using Config class
app.config.from_object(Config)

# Bind the db to the app (the initialization is handled in app/__init__.py)
db.init_app(app)
jwt.init_app(app)  # Initialize the JWTManager with the Flask app

# Debug: Print the SQLALCHEMY_DATABASE_URI
print("SQLALCHEMY_DATABASE_URI:", app.config['SQLALCHEMY_DATABASE_URI'])

# Enable cross-origin requests (CORS)
CORS(app)

# Register blueprints (routes)
app.register_blueprint(user_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(resume_bp)
app.register_blueprint(job_bp)

# Create directories if they don't exist
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
RESUME_UPLOADS = os.path.join(UPLOAD_FOLDER, 'resumes')

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(RESUME_UPLOADS):
    os.makedirs(RESUME_UPLOADS)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESUME_UPLOADS'] = RESUME_UPLOADS

# Run the app
if __name__ == '__main__':
    app.run(debug=True)