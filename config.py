class Config:
    # URI for the MySQL Database
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:1735@localhost/job_finder'
    
    # Disable SQLAlchemy event system to save memory and improve performance
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Secret key for session management and JWT encoding
    SECRET_KEY = '568'  # Replace with a more secure and randomly generated secret key
    
    # JWT secret key for signing tokens (important for security)
    JWT_SECRET_KEY = 'your-strong-jwt-secret-key'  # It's a good practice to store this in environment variables
