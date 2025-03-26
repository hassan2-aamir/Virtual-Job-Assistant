from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User  # Import the 'User' model correctly
from flask_cors import CORS
import logging
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token

# Create a Blueprint for the 'users' routes
user_bp = Blueprint('user_bp', __name__)

# Enable CORS for the 'user_bp' Blueprint
CORS(user_bp)

# Define role strings for consistency
ROLE_EMPLOYEE = 'employee'
ROLE_EMPLOYER = 'employer'
ROLE_NAME_MAP = {ROLE_EMPLOYEE: 'employee', ROLE_EMPLOYER: 'employer'}

# Create a mapping from role strings to their database representations
ROLE_MAP = {ROLE_EMPLOYEE: 'employee', ROLE_EMPLOYER: 'employer'}

@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.json

    # Ensure required fields are present
    required_fields = ['name', 'email', 'role', 'password']
    if not data or not all(k in data for k in required_fields):
        missing_fields = [field for field in required_fields if field not in data]
        current_app.logger.error(f"Missing required fields: {missing_fields}")
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        current_app.logger.error(f"Email already exists: {data['email']}")
        return jsonify({'error': 'Email already exists'}), 400

    try:
        # Ensure role is valid
        role_name = data['role'].lower()
        if role_name not in ROLE_MAP:
            current_app.logger.error(f"Invalid role value: {data['role']}")
            return jsonify({'error': 'Invalid role value'}), 400

        # Create a new user from the data
        user = User(
            name=data['name'],
            email=data['email'],
            role=role_name,  # Store the role as a string
            profile_picture=data.get('profile_picture', '')  # Default to empty string if not provided
        )

        # Hash the password before storing it using 'set_password'
        user.set_password(data['password'])

        # Add the user to the session and commit
        db.session.add(user)
        db.session.commit()

        # Log success
        current_app.logger.info(f"User created successfully with ID: {user.id}")

        # Return a success message with the user's ID
        return jsonify({'message': 'User created successfully', 'user_id': user.id}), 201

    except Exception as e:
        # Rollback if something goes wrong and return an error message
        db.session.rollback()

        # Log the error
        current_app.logger.error(f"Error during user creation: {str(e)}")

        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


# GET route to get all users
@user_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.all()  # Use 'User' model instead of 'users'
    users_data = [{'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role, 'profile_picture': u.profile_picture} for u in users]
    return jsonify(users_data)

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # Ensure required fields are present
    if not data or 'email' not in data or 'password' not in data:
        current_app.logger.error("Missing email or password in login request")
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        # Find the user by email
        user = User.query.filter_by(email=data['email']).first()
        
        # Check if user exists and password is correct
        if not user or not user.check_password(data['password']):
            current_app.logger.error(f"Invalid login attempt for email: {data['email']}")
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Send role as string (employee/employer)
        role_name = user.role
        
        # Create user data to return
        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': role_name,
            'profile_picture': user.profile_picture
        }
        
        # Generate JWT token
        token = create_access_token(identity=str(user.id))
        
        current_app.logger.info(f"User logged in successfully: {user.id}")
        return jsonify({'user': user_data, 'token': token}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error during login: {str(e)}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500
    
# PATCH route to update a user's role
@user_bp.route("/users/<int:user_id>/role", methods=["PATCH"])
def update_user_role(user_id):
    new_role = request.json.get("role")
    print(f"Received new role: {new_role}")  # Log the received role

    # Ensure the new role is valid
    if new_role not in [ROLE_EMPLOYEE, ROLE_EMPLOYER]:
        return {"error": "Invalid role. Only 'employee' or 'employer' are allowed."}, 400

    # Proceed with the update
    user = User.query.get(user_id)
    if user:
        user.role = new_role  # Update the role to the string value
        try:
            db.session.commit()  # Save changes to the database
            return {"message": "Role updated successfully."}, 200
        except Exception as e:
            db.session.rollback()  # Rollback in case of an error
            print(f"Error occurred: {e}")
            return {"error": str(e)}, 500
    else:
        return {"error": "User not found."}, 404


@user_bp.route("/change-password", methods=["POST"])
@jwt_required()  
def change_password():

    current_user_id = get_jwt_identity()  # Get the current user's ID from the JWT
    if not isinstance(current_user_id, str):
        return jsonify({"msg": "Subject must be a string"}), 422

    data = request.json
    currentPassword = data.get("currentPassword")
    newPassword = data.get("newPassword")
    

    user = User.query.get(current_user_id)  # Fetch the user from the database
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Ensure required fields are present
    if not data or 'currentPassword' not in data or 'newPassword' not in data:
        return jsonify({'error': 'Current password and new password are required'}), 400

    # Check if the current password is correct
    if not user.check_password(currentPassword):
        return jsonify({'error': 'Current password is incorrect'}), 401

    # Update the password
    user.set_password(newPassword)
    db.session.commit()  # Save changes to the database

    return jsonify({'message': 'Password updated successfully'}), 200