document.addEventListener('DOMContentLoaded', () => {
    const holder = document.getElementById('editorjs');
    if (!holder) {
        console.error('Editor holder element not found');
        return;
    }

    const rawContent = holder.dataset.noteContent;
    const apiEndpoint = holder.dataset.apiEndpoint;
    const userId = holder.dataset.userId;
    const noteId = holder.dataset.noteId;
    const viewOnly = holder.dataset.viewOnly === 'true';

    console.log('Initial noteId: ', noteId, 'Type: ', typeof noteId);
    console.log('View only mode: ', viewOnly);

    let noteData = {};
    try {
        noteData = JSON.parse(rawContent || '{}');
    } catch (e) {
        console.error('Invalid JSON in data-note-content', e);
    }

    // Khởi tạo tags và color
    let tags = [];
    let selectedColor = holder.dataset.noteColor || 'note-green';
    if (holder.dataset.noteTags) {
        try {
            const parsed = JSON.parse(holder.dataset.noteTags);
            tags = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Invalid JSON in data-note-tags', e);
        }
    }

    const tools = {
        header: {
            class: Header,
            inlineToolbar: ['link']
        },
        list: {
            class: EditorjsList,
            inlineToolbar: true,
            config: {
                defaultStyle: 'unordered'
            }
        },
        paragraph: {
            class: Paragraph,
            inlineToolbar: true
        },
        table: Table,
        math: MathTex,
        Marker: Marker,
        inlineCode: InlineCode
    };

    // Thêm codeBox nếu không ở chế độ readonly
    if (!viewOnly) {
        tools.codeBox = {
            class: CodeBox,
            config: {
                themeURL: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/github.min.css',
                themeName: 'github',
                useDefaultTheme: 'light'
            }
        };
    }

    const editor = new EditorJS({
        holder: 'editorjs',
        autofocus: !viewOnly,
        data: noteData,
        readOnly: viewOnly,
        tools: tools,
        placeholder: viewOnly ? "" : "Write notes here..."
    });

    // Xử lý tags
    const tagsContainer = document.getElementById('tags-container');

    function renderTags() {
        if (!tagsContainer) return;
        tagsContainer.innerHTML = tags.map(tag =>
            `<span class="tag">${tag}
                <i class="remove-tag bi bi-x-circle-fill" data-tag="${tag}"></i>
            </span>`
        ).join('');
    }

    renderTags();

    // Hàm lấy danh sách bình luận
    async function fetchComments() {
        if (!noteId || noteId === 'undefined' || isNaN(parseInt(noteId))) {
            console.log('No valid noteId provided - skipping comments');
            document.getElementById('commentsContainer').innerHTML = '<p class="text-muted">Save note to turn on comment.</p>';
            return;
        }

        try {
            console.log('Fetching comments for noteId:', noteId);
            const response = await fetch(`/api/comments/${noteId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            const comments = result.data || [];

            const container = document.getElementById('commentsContainer');
            container.innerHTML = '';

            if (comments.length === 0) {
                container.innerHTML = '<p class="text-muted">No comments yet.</p>';
                return;
            }

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment mb-3 p-3 border rounded';
                commentElement.innerHTML = `
                    <div class="d-flex justify-content-between">
                        <strong>${comment.user_name}</strong>
                        <small>${new Date(comment.created_at).toLocaleString('vi-VN')}</small>
                    </div>
                    <p class="mt-2">${comment.content}</p>
                `;
                container.appendChild(commentElement);
            });
        } catch (error) {
            console.error('Error fetch comments:', error);
            document.getElementById('commentsContainer').innerHTML = '<p class="text-danger">Error loading comments.</p>';
        }
    }

    // Hàm gửi bình luận
    async function submitComment(event) {
        event.preventDefault();
        const commentForm = document.getElementById('commentForm');
        const commentContent = document.getElementById('commentContent');
        if (!commentForm || !commentContent) {
            console.error('commentForm or commentContent not found in DOM');
            return;
        }

        const content = commentContent.value.trim();
        console.log('Attempting to submit comment with noteId:', noteId, 'content:', content);

        if (!content) {
            alert('Please enter comment content.');
            return;
        }

        if (!noteId || noteId === 'undefined' || isNaN(parseInt(noteId))) {
            console.warn('Invalid noteId:', noteId);
            alert('Please save the note before commenting.');
            return;
        }

        try {
            console.log('Sending comment request to /api/comments/', noteId);
            const response = await fetch(`/api/comments/${noteId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            if (result.status === 'success') {
                console.log('Comment submitted successfully');
                commentContent.value = '';
                fetchComments();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Error submitting comment. Please try again.');
        }
    }

    // Khởi tạo sự kiện bình luận
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', submitComment);
    }
    fetchComments();
});

document.addEventListener('DOMContentLoaded', function() {
    const deleteNoteBtn = document.querySelector('.btn-danger[data-note-id]');
    
    if (deleteNoteBtn) {
        deleteNoteBtn.addEventListener('click', async function() {
            const noteId = this.getAttribute('data-note-id');
            
            // Hiển thị hộp thoại xác nhận trước khi xóa
            if (confirm('Bạn có chắc chắn muốn xóa ghi chú này không? Hành động này không thể hoàn tác.')) {
                try {
                    // Gửi yêu cầu xóa đến máy chủ
                    const response = await fetch(`/api/notes/${noteId}/delete`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        alert('Ghi chú đã được xóa thành công');
                        window.location.href = '/admin/manage-contents';
                    } else {
                        alert('Lỗi: ' + (result.message || 'Không thể xóa ghi chú'));
                    }
                } catch (error) {
                    console.error('Lỗi khi xóa ghi chú:', error);
                    alert('Đã xảy ra lỗi khi xóa ghi chú. Vui lòng thử lại.');
                }
            }
        });
    }
});