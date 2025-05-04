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
    const tagInput = document.getElementById('tag-input');

    function renderTags() {
        if (!tagsContainer) return;
        tagsContainer.innerHTML = tags.map(tag =>
            `<span class="tag">
                <span class="tag-text">${tag}</span>
                <i class="remove-tag bi bi-x-circle-fill" data-tag="${tag}"></i>
            </span>`
        ).join('');
    }

    if (tagInput && tagsContainer && !viewOnly) {
        tagInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (tagInput.value.trim()) {
                    const t = tagInput.value.trim();
                    if (!tags.includes(t)) tags.push(t);
                    tagInput.value = '';
                    renderTags();
                }
            }
        });

        tagsContainer.addEventListener('click', e => {
            if (e.target && e.target.classList.contains('remove-tag')) {
                tags = tags.filter(t => t !== e.target.dataset.tag);
                renderTags();
            }
        });
    }

    // Xử lý color picker
    const colorPicker = document.getElementById('color-picker');

    function renderColorPicker() {
        if (!colorPicker) return;
        Array.from(colorPicker.children).forEach(e1 => {
            e1.classList.toggle('selected', e1.dataset.color === selectedColor);
        });
    }

    if (colorPicker && !viewOnly) {
        colorPicker.addEventListener('click', e => {
            if (e.target && e.target.classList.contains('color-option')) {
                selectedColor = e.target.dataset.color;
                renderColorPicker();
            }
        });
    }

    renderTags();
    renderColorPicker();

    // Hàm lưu ghi chú
    let saveInProgress = false;
    async function doSave() {
        if (viewOnly) {
            console.log('View only mode - skipping save');
            return;
        }
        if (saveInProgress) return;
        saveInProgress = true;

        try {
            const output = await editor.save();
            const title = document.getElementById('page-title')?.textContent.trim() || '';
            const isPublicCheckbox = document.getElementById('togglePublicNote');
            const isPublic = isPublicCheckbox ? isPublicCheckbox.checked : false;

            const payload = {
                title,
                content: output,
                color: selectedColor,
                tags,
                user_id: userId,
                is_public: isPublic
            };

            const resp = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) throw new Error(`Save failed: ${resp.status}`);
            const data = await resp.json();
            if (data.note_id) {
                window.location.href = `/edit-note/${data.note_id}`;
            }
            console.log('Saved successfully');
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            saveInProgress = false;
        }
    }

    // Lưu khi nhấn Ctrl+S / Cmd+S và auto-save
    if (!viewOnly) {
        window.addEventListener('keydown', async e => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                await doSave();
            }
        });

        // Auto-save mỗi 60s
        const autoSaveInterval = setInterval(doSave, 60000);
        window.addEventListener('beforeunload', () => clearInterval(autoSaveInterval));
    } else {
        console.log('Auto-save and manual save disabled in view-only mode');
    }

    // Hàm xuất PDF
    async function exportPDF(blocks, title) {
        try {
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocks, title })
            });
            if (!response.ok) throw new Error(`Export PDF failed: ${response.status}`);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'note.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export PDF error:', err);
        }
    }

    // Bắt sự kiện Export PDF
    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            try {
                const { blocks } = viewOnly ? noteData : await editor.save();
                const title = document.getElementById('page-title')?.textContent.trim() || '';
                await exportPDF(blocks, title);
            } catch (err) {
                console.error('Export PDF error:', err);
            }
        });
    } else {
        console.warn('Export PDF button not found');
    }

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