from flask_restx import Namespace, Resource, fields
from functools import wraps
from flask import jsonify, request
from app.models import User, Website, Metric, Alert
from app import db
import jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY


auth_ns = Namespace('auth', description="Authentication Endpoints")

#Define models
user_model = auth_ns.model("User", {
    "id": fields.Integer,
    "name": fields.String,
    "email": fields.String
})

register_model = auth_ns.model("Regiter", {
    "name": fields.String(required=True, description="User's Name"),
    "email": fields.String(required=True, description="User's Email"),
    "password": fields.String(required=True, description="User's Password")
})

login_model = auth_ns.model("Login", {
    "email": fields.String(required=True, description="User's Email"),
    "password": fields.String(required=True, description="User's Password")
})

token_model = auth_ns.model("TokenResponse", {
    "message": fields.String,
    "token": fields.String
})

update_profile_model = auth_ns.model('UpdateProfile', {
    'name': fields.String(required=False, description="New Name"),
    'email': fields.String(required=False, description="New Email"),
})

change_password_model = auth_ns.model("ChangePassword", {
    "old_password": fields.String(required=True, description="Old Password"),
    "new_password": fields.String(required=True, description="New Password")
})

#Secret key for jwt
SECRET_KEY = "This_Is_The_Key"

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
                current_user = db.session.get(User, data["user_id"])
                if not current_user:
                    return jsonify({"error": "Invalid token!"}), 401
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token has expired!"}), 401
            except jwt.InvalidTokenError:
                return jsonify({"error": "Invalid token!"}), 401

            #Pass current user to route
            return f(current_user, *args, **kwargs)

    return decorated

#Route for user registration
@auth_ns.route('/register')
class RegisterUser(Resource):
    @auth_ns.expect(register_model)
    @auth_ns.response(201, "User Registered Successfully!", user_model)
    @auth_ns.response(400, "Missing Required Fields")
    @auth_ns.response(409, "Email Already Exists")
    def post(self):
        """Register a new user"""
        data = request.get_json()
        #Extract and validate input
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return {"error": "Missing required fields"}, 400

        #Check if email already registered
        if User.query.filter_by(email=email).first():
            return {"error": "Email already exists"}, 409

        #Create a new User object
        new_user = User(name=name, email=email)
        new_user.set_password(password)

        #Add user to database
        db.session.add(new_user)
        db.session.commit()

        return {
            "message": "User registered successfully!",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email
            }
        }, 201

#Route for user login
@auth_ns.route('/login')
class LoginUser(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.response(200, "Login Successful!", token_model)
    @auth_ns.response(400, "Missing Email or Password")
    @auth_ns.response(401, "Invalid Email or Password")
    def post(self):
        """User Login"""
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

        return {
            "message": "Login successful!",
            "token": token
        }, 200



#Retrieve User profile
@auth_ns.route('/profile')
class UserProfile(Resource):
    @auth_ns.response(200, "User Profile Retrieved Successfully!", user_model)
    @token_required
    def get(self, current_user):
        """Retrieve User Profile"""
        return {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }, 200

    @auth_ns.expect(update_profile_model)
    @auth_ns.response(200, "Profile Updated Successfully!")
    @auth_ns.response(400, "No Fields to Update")
    @token_required
    def put(self, current_user):
        """Update User Profile"""
        data = request.get_json()

        if not data.get("name") and not data.get("email"):
            return {"error": "No fields to update"}, 400

        if "name" in data:
            current_user.name = data["name"]
        if "email" in data:
            current_user.email = data["email"]

        db.session.commit()

        return {
            "message": "Profile Updated Successfully!",
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }, 200

#Change User Password
@auth_ns.route('/change-password')
class ChangePassword(Resource):
    @auth_ns.expect(change_password_model)
    @auth_ns.response(200, "Password Updated Successfully!")
    @auth_ns.response(400, "Missing Old or New Password")
    @auth_ns.response(401, "Incorrect Old Password")
    @token_required
    def put(self, current_user):
        """Change Password"""
        data = request.get_json()
        #Extract and validate
        old_password = data.get("old_password")
        new_password = data.get("new_password")

        if not old_password or not new_password:
            return jsonify({"error": "Missing old or new password"}), 400

        #Verify old password
        if not current_user.check_password(old_password):
            return jsonify({"error": "Incorrect old password"}), 401

        #Update password
        current_user.set_password(new_password)
        db.session.commit()

        return jsonify({"message": "Password updated successfully!"}), 200

# Delete User Account
@auth_ns.route('/delete')
class DeleteUser(Resource):
    @auth_ns.response(200, "User Account Deleted Successfully!")
    @auth_ns.response(404, "User Not Found")
    @token_required
    def delete(self, current_user):
        """Delete User Account"""
        user = db.session.get(User, current_user.id)
        if not user:
            return {"error": "User not found"}, 404

        websites = Website.query.filter_by(user_id=user.id).all()
        for website in websites:
            Metric.query.filter_by(website_id=website.id).delete()
            Alert.query.filter_by(website_id=website.id).delete()
            db.session.delete(website)

        db.session.delete(user)
        db.session.commit()

        return {"message": "User account deleted successfully!"}, 200
