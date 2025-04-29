const holder = document.getElementById('editorjs');
const rawContent = holder.dataset.noteContent;
const apiEndpoint = holder.dataset.apiEndpoint;
const userId = holder.dataset.userId;
const noteId = holder.dataset.noteId;
const viewOnly = holder.dataset.viewOnly === 'true';


console.log ('Innitial noteId: ', noteId, 'Type: ', typeof noteId);
console.log ('View only mode: ', viewOnly);

let noteData = JSON.parse(rawContent);

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

// thêm codeBox nếu không ở chế độ readonly
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

async function doSave() {
    if (viewOnly){
        console.log('View only mode - skipping save');
        return;
    }

    try {
        const output = await editor.save();
        const title   = document.getElementById('page-title').textContent.trim();
        const isPublicCheckbox = document.getElementById('togglePublicNote');
        const isPublic = isPublicCheckbox ? isPublicCheckbox.checked : false;
        
        const payload = {
            title:   title,
            content: output,
            user_id: userId,
            is_public: isPublic
        };

        const resp = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();

        if (data.note_id) {
            window.location.href = `/edit-note/${data.note_id}`;;
        }

        console.log('Saved');
    } catch(err) {
        console.error('Save error:', err);
    }
}

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
if(!viewOnly) {
    window.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            doSave();
        }
    });

    setInterval(doSave, 60000);
} else {
    console.log('Ato-save and manual save disabled in view-only mode');
}

document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', submitComment);
    }
    fetchComments();
});

