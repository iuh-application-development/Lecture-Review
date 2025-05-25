import jwt
from datetime import datetime, timedelta
import os
from functools import wraps
from flask import current_app, request, jsonify

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your_jwt_secret_key')
JWT_ALGORITHM = 'HS256'

def generate_password_reset_token(email, expires_minutes=30):
    expiry_time = datetime.utcnow() + timedelta(minutes=expires_minutes)
    
    payload = {
        'exp': expiry_time,
        'iat': datetime.utcnow(),
        'sub': email,
        'purpose': 'password_reset'  # Chỉ định mục đích của token
    }
    
    # Tạo token JWT
    token = jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )
    
    return token

def verify_password_reset_token(token):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )
        
        if payload.get('purpose') != 'password_reset':
            return None
            
        return payload.get('sub')
        
    except jwt.ExpiredSignatureError:
        # Token đã hết hạn
        return None
    except jwt.InvalidTokenError:
        # Token không hợp lệ
        return None