from functools import wraps
from flask import Blueprint, jsonify, request
from app.models import User
from app import db
import jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

#Secret key for jwt
SECRET_KEY = "This_Is_The_Key"

#Route for user registration
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    #Extract and validate input
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    #Check if email already registered
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 409

    #Create a new User object
    new_user = User(name=name, email=email)
    new_user.set_password(password)

    #Add user to database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully!",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }), 201

#Route for user login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    #Extract and validate
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    #Fetch user by email
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    #Generate JWT Token
    token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(hours=1)
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful!",
        "token": token
    }), 200

#Helper function to check validity
# of token for protected routes.
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
            token = None
            if "Authorization" in request.headers:
                auth_header = request.headers["Authorization"]
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]

            print("Recieved Token:", token)

            if not token:
                return jsonify({"error": "Token is missing!"}), 401

            try:
                #Decode token
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                #Fetch user from database
                current_user = User.query.get(data["user_id"])
                if not current_user:
                    return jsonify({"error": "Invalid token!"}), 401
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token has expired!"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token!"}), 401

            #Pass current user to route
            return f(current_user, *args, **kwargs)

    return decorated

#Retrieve User profile
@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    return jsonify({
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }), 200

#Update User Profile
@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()

    #Validate input
    name = data.get("name")
    email = data.get("email")

    if not name and not email:
        return jsonify({"error": "No fields to update"}), 400

    #Update user details
    if name:
        current_user.name = name
    if email:
        current_user.email = email

    db.session.commit()

    return jsonify({
        "message": "Profile updated successfully!",
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }), 200

#Change User Password
@auth_bp.route('/change-password', methods=['PUT'])
@token_required
def change_password(current_user):
    data = request.get_json()

    #Extract and validate
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not old_password or not new_password:
        return jsonify({"error": "Missing old or new password"}), 400

    #Verify old password
    if not current_user.check_password(old_password):
        return jsonify({"error": "Incorrect old paddword"}), 401

    #Update password
    current_user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password updated successfully!"}), 200
