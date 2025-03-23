from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
from routes.job_routes import job_routes
from routes.user_routes import user_routes

# Initialize the Flask application
app = Flask(__name__)

# Configure the app using Config class
app.config.from_object(Config)

# Initialize the SQLAlchemy object (db) here
db = SQLAlchemy(app)

# Enable cross-origin requests (CORS)
CORS(app)

# Register blueprints (routes)
app.register_blueprint(job_routes)
app.register_blueprint(user_routes)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
