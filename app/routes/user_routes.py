from flask import Blueprint, request, jsonify
from app import db
#from app.models.users import Users

user_bp = Blueprint('user_bp', __name__)

# Create a new user
@user_bp.route('/register', methods=['POST'])
def create_user():
    data = request.json
    if not data or not all(k in data for k in ('name', 'email', 'role', 'password', 'profile_picture')):
        return jsonify({'error': 'Missing required fields'}), 400
    
    user = Users(
        name=data['name'],
        email=data['email'],
        role=data['role'],
        profile_picture=data['profile_picture']
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'user_id': user.id}), 201

# Get all users
@user_bp.route('/', methods=['GET'])
def get_users():
    users = Users.query.all()
    users_data = [{'id': u.id, 'name': u.name, 'email': u.email, 'role': u.role, 'profile_picture': u.profile_picture} for u in users]
    return jsonify(users_data)

# Get a single user by ID
@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = Users.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user_data = {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role, 'profile_picture': user.profile_picture}
    return jsonify(user_data)
