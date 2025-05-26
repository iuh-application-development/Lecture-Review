from datetime import datetime, timedelta
from flask import session, request
import time

class SessionTracker:
    active_sessions = {}
    
    SESSION_TIMEOUT = 30
    
    @classmethod
    def update_session(cls):
        """Cập nhật thời gian hoạt động của session hiện tại"""
        from flask_login import current_user
        
        if current_user and current_user.is_authenticated:
            user_id = current_user.id
            cls.active_sessions[user_id] = {
                'last_activity': datetime.now(),
                'ip': request.remote_addr,
                'user_agent': request.user_agent.string
            }
    
    @classmethod
    def cleanup_sessions(cls):
        """Dọn dẹp các session không còn hoạt động"""
        current_time = datetime.now()
        timeout_limit = timedelta(minutes=cls.SESSION_TIMEOUT)
        
        # Lọc ra các session còn hoạt động
        cls.active_sessions = {
            user_id: data for user_id, data in cls.active_sessions.items()
            if current_time - data['last_activity'] < timeout_limit
        }
    
    @classmethod
    def get_active_count(cls):
        """Trả về số lượng session đang hoạt động"""
        cls.cleanup_sessions()
        count = len(cls.active_sessions)
        return count
    
    @classmethod
    def get_active_sessions(cls):
        """Trả về thông tin chi tiết về các session đang hoạt động"""
        cls.cleanup_sessions()
        return cls.active_sessions