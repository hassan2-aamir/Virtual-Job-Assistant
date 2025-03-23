from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User  # Use 'User' instead of 'users'
from flask_cors import CORS
import logging

# Create a Blueprint for the 'users' routes
user_bp = Blueprint('user_bp', __name__)

# Enable CORS for the 'user_bp' Blueprint
CORS(user_bp)
ROLE_MAP = {
    'employee': 1,
    'employer': 2,
    # Add other roles as needed
}

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
        # Convert role from name to integer if it's a valid name
        role_name = data['role'].lower()  # Make sure to handle the input as lowercase
        role = ROLE_MAP.get(role_name)

        if role is None:
            current_app.logger.error(f"Invalid role value: {data['role']}")
            return jsonify({'error': 'Invalid role value'}), 400

        # Create a new user from the data
        user = User(
            name=data['name'],
            email=data['email'],
            role=role,  # Store the role as an integer
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


# GET route to get a single user by ID
@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)  # Use 'User' model instead of 'users'
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user_data = {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role, 'profile_picture': user.profile_picture}
    return jsonify(user_data)
