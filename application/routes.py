from flask import current_app as app, jsonify, render_template, request
from flask_security import auth_required, login_user, logout_user, current_user, roles_required, roles_accepted, hash_password, verify_password
from datetime import datetime

from .database import db
from .models import *
from .utils import *


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/api/login', methods=['POST'])
def user_login():
    body = request.get_json()
    email = body['email']
    password = body['password']
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = app.security.datastore.find_user(email=email)
    if user: 
        if verify_password(password, user.password):
            login_user(user)
            return jsonify({"message": "Login successful",
                            "roles": roles_list(user.roles), 
                            "user_id": user.id,
                            "auth-token": user.get_auth_token()}), 200
        else:
            return jsonify({"error": "Invalid password"}), 400

    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/api/user_details', methods=['GET'])
@auth_required('token')  # Ensures the user is authenticated
@roles_accepted('admin','user')
def get_user_details():
    if not current_user.is_authenticated:
        return jsonify({"error": "User not authenticated"}), 401
    
    roles = [role.name for role in current_user.roles]
    return jsonify({
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": roles[0]
    }), 200

@app.route('/api/register', methods=['POST'])
def register_user():
    credentials = request.get_json()
    email = credentials['email']
    username = credentials['username']
    password = credentials['password']
    confirm_password = credentials['confirm_password']
    if not email or not username or not password or not confirm_password:
        return jsonify({"error": "please fill all the fields"}), 400
    
    if password != confirm_password:
        return jsonify({"error": "password do not match"}), 400
    
    if not app.security.datastore.find_user(email=credentials['email']):
        app.security.datastore.create_user(
            email=credentials['email'],
            username=credentials['username'],
            password=hash_password(credentials['password']),
            roles = ['user']
        )
        db.session.commit()
        return jsonify({"message": "User created successfully"})
    else:
        return jsonify({"error": "User already exists"}), 400