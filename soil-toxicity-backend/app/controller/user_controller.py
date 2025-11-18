# user_controller.py - Fixed version without separate Flask app
# user controller - specifies API end points that come from frontend
from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.model.user import User
from app import db, bcrypt
from datetime import datetime

#Blueprint defines prefixes for all APIs we have
user_bp = Blueprint('user', __name__)

# Get all users (protected)
@user_bp.route('', methods=['GET'])
@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
    } for user in users])

# Get a single user by ID (protected)
@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_user(id):
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
    })

@user_bp.route('', methods=['POST'])
@user_bp.route('/', methods=['POST'])
def create_user():
    try:
        # Get JSON data directly from request
        data = request.get_json()
        print(f"Received data: {data}")
        
        # Handle both direct data and nested formData structure
        if 'formData' in data:
            form_data = data['formData']
        else:
            form_data = data
        
        if not form_data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check required fields
        required_fields = ['username', 'email', 'password']
        missing_fields = [field for field in required_fields if field not in form_data or not form_data[field]]
        
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == form_data['username']) | 
            (User.email == form_data['email'])
        ).first()
        
        if existing_user:
            if existing_user.username == form_data['username']:
                return jsonify({'error': 'Username already exists'}), 409
            else:
                return jsonify({'error': 'Email already exists'}), 409
        
        # Check phone number if provided
        if form_data.get('phone_number'):
            existing_phone = User.query.filter_by(phone_number=form_data['phone_number']).first()
            if existing_phone:
                return jsonify({'error': 'Phone number already exists'}), 409
        
        # Hash the password
        hashed_password = bcrypt.generate_password_hash(form_data['password']).decode('utf-8')
        
        # Create new user
        user = User(
            username=form_data['username'],
            email=form_data['email'],
            password=hashed_password,
            phone_number=form_data.get('phone_number')
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token for auto-login
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'access_token': access_token,
            'message': 'User created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Update a user (protected)
@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(id)
    if user.id != int(current_user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    data = request.get_json()
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    if data.get('password'):
        user.password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    db.session.commit()
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email
    })

# Delete a user (protected)
@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(id)
    if user.id != int(current_user_id):
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 204

# Login route
@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'access_token': access_token,
            'message': 'Login successful'
        }), 200
    return jsonify({'error': 'Invalid username or password'}), 401
    
@user_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'username': user.username,
        'id': user.id,
        'email': user.email
    }), 200