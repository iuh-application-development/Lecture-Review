from sqlalchemy import func
from ..models import Note, User, ShareNote, db
from .session_tracker import SessionTracker
import json

class ChartDataGenerator:
    @staticmethod
    def get_notes_data():
        # Chuẩn bị dữ liệu cho biểu đồ số lượng note tạo theo ngày
        notes_by_day = db.session.query(
            func.date(Note.created_at).label('date'),
            func.count(Note.id).label('count')
        ).group_by(
            func.date(Note.created_at)
        ).order_by(
            func.date(Note.created_at)
        ).all()
        
        # Lấy dữ liệu public notes theo ngày
        public_notes_by_day = db.session.query(
            func.date(Note.created_at).label('date'),
            func.count(Note.id).label('count')
        ).filter(
            Note.is_public == True
        ).group_by(
            func.date(Note.created_at)
        ).order_by(
            func.date(Note.created_at)
        ).all()
        
        # Lấy dữ liệu shared notes theo ngày
        shared_notes_by_day = db.session.query(
            func.date(ShareNote.shared_at).label('date'),
            func.count(ShareNote.id).label('count')
        ).group_by(
            func.date(ShareNote.shared_at)
        ).order_by(
            func.date(ShareNote.shared_at)
        ).all()
        
        # Tạo dữ liệu tích lũy cho note
        notes_dates = [str(row.date) for row in notes_by_day]
        notes_counts = [row.count for row in notes_by_day]
        
        public_notes_dates = [str(row.date) for row in public_notes_by_day]
        public_notes_counts = [row.count for row in public_notes_by_day]
        
        shared_notes_dates = [str(row.date) for row in shared_notes_by_day]
        shared_notes_counts = [row.count for row in shared_notes_by_day]
        
        # Tạo tất cả các ngày duy nhất cho trục x
        all_dates = sorted(list(set(notes_dates + public_notes_dates + shared_notes_dates)))
        
        # Tính tổng tích lũy cho notes
        notes_cumulative = []
        public_notes_cumulative = []
        shared_notes_cumulative = []
        running_total_notes = 0
        running_total_public = 0
        running_total_shared = 0
        
        # Tạo mảng dữ liệu chuẩn với tất cả các ngày
        for date in all_dates:
            # Tổng số note
            if date in notes_dates:
                idx = notes_dates.index(date)
                running_total_notes += notes_counts[idx]
            notes_cumulative.append(running_total_notes)
            
            # Public note
            if date in public_notes_dates:
                idx = public_notes_dates.index(date)
                running_total_public += public_notes_counts[idx]
            public_notes_cumulative.append(running_total_public)
            
            # Shared note
            if date in shared_notes_dates:
                idx = shared_notes_dates.index(date)
                running_total_shared += shared_notes_counts[idx]
            shared_notes_cumulative.append(running_total_shared)
        
        # Chuyển dữ liệu sang định dạng JSON để sử dụng trong JavaScript
        notes_chart_data = {
            'dates': all_dates,
            'total_notes': notes_cumulative,
            'public_notes': public_notes_cumulative,
            'shared_notes': shared_notes_cumulative
        }
        
        return json.dumps(notes_chart_data)

    @staticmethod
    def get_accounts_data():
        # Chuẩn bị dữ liệu cho biểu đồ số lượng tài khoản tạo theo ngày
        accounts_by_day = db.session.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).group_by(
            func.date(User.created_at)
        ).order_by(
            func.date(User.created_at)
        ).all()
        
        # Tạo dữ liệu tích lũy cho account
        accounts_dates = [str(row.date) for row in accounts_by_day]
        accounts_counts = [row.count for row in accounts_by_day]
        
        # Tính tổng tích lũy cho accounts
        accounts_cumulative = []
        running_total = 0
        for count in accounts_counts:
            running_total += count
            accounts_cumulative.append(running_total)
        
        # Chuyển dữ liệu sang định dạng JSON để sử dụng trong JavaScript
        accounts_chart_data = {
            'dates': accounts_dates,
            'counts': accounts_cumulative
        }
        
        return json.dumps(accounts_chart_data)
    
    @staticmethod
    def get_dashboard_data():
        total_users = User.query.count()
        total_notes = Note.query.count()
        
        active_sessions = SessionTracker.get_active_count()

        return {
            'total_users': total_users,
            'total_notes': total_notes,
            'active_sessions': active_sessions
        }
