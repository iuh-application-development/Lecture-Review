from flask import current_app
from ..models import Note
from google import genai
import os
import json

api_key = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

def generate_quiz(note_id, question_count=5):
    note = Note.query.get(note_id)

    if not note:
        return json.dumps({'error': 'Note not found!'})
    
    content_text = str(note.content)

    prompt = f'''
    Tạo một quiz gồm {question_count} câu hỏi trắc nghiệm dựa trên nội dung sau đây: 

    {content_text}

    Trả về kết quả chính xác theo định dạng JSON sau (không thêm giải thích hay bất kỳ thông tin nào khác):
    {{
        "quiz": [
            {{
                "question": "Câu hỏi 1",
                "options": [
                    "Phương án A",
                    "Phương án B",
                    "Phương án C",
                    "Phương án D"
                ],
                "answer": 0,
                "explanation": "Giải thích tại sao đáp án đúng"
            }},
            ... 4 câu hỏi khác
        ]
    }}

    Lưu ý:
    - "answer" là chỉ số (index) của đáp án đúng trong mảng "options" (0, 1, 2 hoặc 3)
    - Câu hỏi phải liên quan trực tiếp đến nội dung được cung cấp
    - Đảm bảo các phương án đủ khác biệt và có một đáp án đúng rõ ràng
    '''

    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[content_text, prompt]
        )
        return response.text
    except Exception as e:
        return json.dumps({'error': f'Error generating quiz: {str(e)}'})