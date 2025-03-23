from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'  # Change this to match your actual table name
    id = db.Column(db.Integer, primary_key=True)  # ID as Integer
    name = db.Column(db.String(255), unique=True, nullable=False)  # Name as VARCHAR(255)
    email = db.Column(db.String(255), unique=True, nullable=False)  # Email as VARCHAR(255)
    role = db.Column(db.SmallInteger, nullable=False)  # Role as SMALLINT
    password_hash = db.Column(db.String(255), nullable=False)  # Hashed password as VARCHAR(255)
    profile_picture = db.Column(db.String(55), nullable=True, default='')  # Profile picture as VARCHAR(55)
    signup_date = db.Column(db.TIMESTAMP, default=db.func.current_timestamp(), nullable=False)  # Timestamp for signup
    last_login = db.Column(db.TIMESTAMP, default=db.func.current_timestamp(), nullable=True)  # Timestamp for last login

    # Set password hash
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # Check password hash
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
