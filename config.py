class Config:
    # URI for the MySQL Database
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:1735@localhost:3306/job_finder'
    
    # Disable SQLAlchemy event system to save memory and improve performance
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Secret key for session management and JWT encoding
    SECRET_KEY = 'abcxyz123098'  # Replace with a more secure and randomly generated secret key
    
    # JWT secret key for signing tokens (important for security)
    JWT_SECRET_KEY = 'your-strong-jwt-secret-key'  # It's a good practice to store this in environment variables

    # Define where to look for JWT tokens (in headers or cookies)
    JWT_TOKEN_LOCATION = ["headers"]  # You can change this to ["cookies"] or ["headers", "cookies"]
    
     # Define the header name for JWT token (default is 'Authorization')
    JWT_HEADER_NAME = 'Authorization'  # You can change this if needed
    
    
    
    # Define the header type for the JWT token (default is 'Bearer')
    JWT_HEADER_TYPE = 'Bearer'  # You can change this if needed
