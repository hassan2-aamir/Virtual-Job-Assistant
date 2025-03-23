from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config
#from app.routes.job_routes import job_routes
#from app.routes.auth import auth_bp
from app.routes.user_routes import user_bp

# Initialize the Flask application
app = Flask(__name__)

# Configure the app using Config class
app.config.from_object(Config)

# Initialize the SQLAlchemy object (db) here
db = SQLAlchemy(app)

# Debug: Print the SQLALCHEMY_DATABASE_URI
print("SQLALCHEMY_DATABASE_URI:", app.config['SQLALCHEMY_DATABASE_URI'])

# Enable cross-origin requests (CORS)
CORS(app)

# Register blueprints (routes)
#app.register_blueprint(job_routes)
#app.register_blueprint(auth_bp)  # Register the auth blueprint
app.register_blueprint(user_bp)


# Run the app
if __name__ == '__main__':
    app.run(debug=True)
