console.log('note_functions.js executing');

document.addEventListener('DOMContentLoaded', function () {
    console.log('note_functions.js DOMContentLoaded');

    // Hàm shareNote cho modal chia sẻ
    async function shareNote(event) {
        console.log('shareNote called at:', new Date().toISOString());
        event.preventDefault();

        const noteIdInput = document.getElementById('noteIdToShare');
        const emailInput = document.getElementById('shareEmail');
        const messageInput = document.getElementById('shareMessage');
        const form = document.getElementById('shareNoteForm');
        const modalElement = document.getElementById('shareNoteModal');
        const canEditCheckbox = document.getElementById('canEdit');

        console.log('Checking DOM elements:', {
            noteIdInput: !!noteIdInput,
            emailInput: !!emailInput,
            messageInput: !!messageInput,
            form: !!form,
            modalElement: !!modalElement,
            canEditCheckbox: !!canEditCheckbox
        });

        if (!noteIdInput || !emailInput || !messageInput || !form || !modalElement || !canEditCheckbox) {
            console.error('Missing required DOM elements:', {
                noteIdInput: !!noteIdInput,
                emailInput: !!emailInput,
                messageInput: !!messageInput,
                form: !!form,
                modalElement: !!modalElement,
                canEditCheckbox: !!canEditCheckbox
            });
            alert('Error: Unable to share note due to missing form elements.');
            return;
        }

        const noteId = noteIdInput.value;
        const recipientEmail = emailInput.value.trim();
        const message = messageInput.value.trim();
        const canEdit = canEditCheckbox.checked;

        console.log('Preparing to share note:', { noteId, recipientEmail, message, canEdit });

        if (!recipientEmail) {
            alert("Please enter the recipient's email!");
            return;
        }

        try {
            console.log('Sending fetch request to /api/share-note');
            const response = await fetch('/api/share-note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    note_id: noteId,
                    recipient_email: recipientEmail,
                    message: message,
                    can_edit: canEdit
                })
            });

            console.log('Fetch response received:', response);
            const result = await response.json();
            console.log('Share response:', result);

            if (result.success) {
                alert('Share successfully!');
                form.reset();
                const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
                modalInstance.hide();
            } else {
                alert('Failed to share note: ' + result.message);
            }
        } catch (error) {
            console.error('Error sharing note:', error);
            alert('Error sharing note. Please try again.');
        }
    }

    // Gán sự kiện cho nút Share trong modal
    console.log ('Attaching event listener to shareNoteBtn');
    const shareButton = document.getElementById('shareNoteBtn');
    console.log('Checking shareNoteBtn:', shareButton);
    if (shareButton) {
        console.log('shareNoteBtn found, attaching event listener');
        shareButton.addEventListener('click', shareNote);
    } else {
        console.log('shareNoteBtn not found - this is normal for pages without share modal');
    }

    // Gắn lại sự kiện khi modal được hiển thị
    document.addEventListener('shown.bs.modal', function(e) {
        if (e.target.id === 'shareNoteModal') {
            console.log('Modal shown, checking shareNoteBtn');
            const shareButton = document.getElementById('shareNoteBtn');
            if (shareButton) {
                console.log('shareNoteBtn found in modal, attaching event listener');
                shareButton.removeEventListener('click', shareNote); // Tránh gắn trùng
                shareButton.addEventListener('click', shareNote);
            } else {
                console.error('shareNoteBtn not found in modal');
            }
        }
    });

    // Xử lý sự kiện click cho tất cả nút share (tĩnh và động)
    document.addEventListener('click', function(e) {
        const shareButton = e.target.closest('.btn-share, .share-note');
        if (shareButton) {
            e.preventDefault();
            const noteId = shareButton.getAttribute('data-note-id');
            console.log('Share button clicked!, noteId:', noteId);
            const noteIdInput = document.getElementById('noteIdToShare');
            const modal = document.getElementById('shareNoteModal');
            if (!modal) {
                console.error('Share modal not found in DOM');
            }
            if (noteIdInput) {
                noteIdInput.value = noteId;
                console.log('Set noteIdToShare to:', noteIdInput.value);
            } else {
                console.error('noteIdToShare input not found!');
            }
        }
    });

    // Logic cho myNotesContainer (dashboard hoặc all_my_notes)
    const container = document.getElementById('myNotesContainer');

    // Định nghĩa hàm createNoteCard
    function createNoteCard(note) {
        const MAX_TITILE_LEN = 25;
        const title = note.title || 'Untitled';
        const truncatedTitle = title.length > MAX_TITILE_LEN ?
                                title.slice(0, MAX_TITILE_LEN) + '...' :
                                title;

        var utc = note.updated_at;
        if (!utc.endsWith("Z")) utc += "Z";
        const updatedAt = new Date(utc);
        const updatedStr = updatedAt.toLocaleString("vi-VN", {
            day:   "2-digit",
            month: "short",
            year: "numeric",
            hour:  "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh"
        });

        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.color} position-relative p-3`;

        const keywords = Array.isArray(note.tags) ? note.tags : [];

        noteCard.innerHTML = `
            <div class="note-content">
                <div class="note-header d-flex justify-content-between align-items-start pb-1">
                    <strong class="d-inline-block"><em>${truncatedTitle}</em></strong>
                    <div class="dropdown">
                        <button class="btn btn-link p-0 border-0" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item share-note" href="#" data-bs-toggle="modal" data-bs-target="#shareNoteModal" data-note-id="${note.id}">
                                <i class="bi bi-share"></i> Share</a></li>
                            <li><a class="dropdown-item text-danger" href="#">
                                <i class="bi bi-trash"></i> Delete</a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-separator"></div>
                <div class="mt-2">
                    ${keywords.map(k => `<span class="badge bg-secondary me-1">${k}</span>`).join("")}
                </div>

                <small class="text-muted">Last updated: ${updatedStr}</small>

            </div>
        `;

        noteCard.addEventListener('click', function (e) {
            if (!e.target.closest('.dropdown')) {
                window.location.href = `/edit-note/${note.id}`;
            }
        });

        const shareButton = noteCard.querySelector('.share-note');
        shareButton.addEventListener('click', function (e) {
            e.preventDefault();
            const noteId = this.getAttribute('data-note-id');
            document.getElementById('noteIdToShare').value = noteId;
        });

        return noteCard;
    }

    // Định nghĩa hàm createSharedNoteCard
    function createSharedNoteCard(share_note) {
        const MAX_TITILE_LEN = 25;
        const title = share_note.title || 'Untitled';
        const truncatedTitle = title.length > MAX_TITILE_LEN ?
                                title.slice(0, MAX_TITILE_LEN) + '...' :
                                title;

        const message = share_note.message;

        var utc = share_note.updated_at;
        if (!utc.endsWith("Z")) utc += "Z";
        const updatedAt = new Date(utc);
        const updatedStr = updatedAt.toLocaleString("vi-VN", {
            day:   "2-digit",
            month: "short",
            year: "numeric",
            hour:  "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh"
        });

        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${share_note.color} position-relative p-3`;

        const keywords = Array.isArray(share_note.tags) ? share_note.tags : [];;

        noteCard.innerHTML = `
            <div class="note-content">
                <div class="note-header d-flex justify-content-between align-items-start pb-1">
                    <strong class="d-inline-block"><em>${truncatedTitle}</em></strong>
                    <div class="dropdown">
                        <button class="btn btn-link p-0 border-0" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item share-note" href="#" data-bs-toggle="modal" data-bs-target="#shareNoteModal" data-note-id="${share_note.note_id}">
                                <i class="bi bi-share"></i> Share</a></li>
                            <li><a class="dropdown-item text-danger" href="#">
                                <i class="bi bi-trash"></i> Delete</a></li>
                        </ul>
                    </div>
                </div>
                <div class="card-separator"></div>
                
                ${message ? `
                    <div class="alert alert-info p-2 mb-2" role="alert" style="font-size: 13px;"> 
                        💌 ${message}
                    </div>
                    ` : ''}

                </div>
                <div class="mt-2">
                    ${keywords.map(k => `<span class="badge bg-secondary me-1">${k}</span>`).join("")}
                </div>

                <small class="text-muted">Last updated: ${updatedStr}</small>
                <br/>
                <small class="text-muted">Shared by: ${share_note.sharer}</small>
            </div>
        `;

        noteCard.addEventListener('click', function (e) {
            if (!e.target.closest('.dropdown')) {
                window.location.href = `/edit-note/${share_note.note_id}`;
            }
        });

        const shareButton = noteCard.querySelector('.share-note');
        shareButton.addEventListener('click', function (e) {
            e.preventDefault();
            const noteId = this.getAttribute('data-note-id');
            document.getElementById('noteIdToShare').value = noteId;
        });

        return noteCard;
    }

    const isDashboard = container.classList.contains('dashboard-container');
    async function fetchNotes() {
        try {
            const limit = container.getAttribute('data-limit') ? parseInt(container.getAttribute('data-limit')) : 9;
            const response = await fetch(`/api/notes?limit=${limit}`);
            const result = await response.json();
            const notes = result.data || [];

            container.innerHTML = '';

            const existingArrow = document.querySelector('.dashboard-arrow-redirect');
            if (existingArrow) {
                existingArrow.remove();
            }

            if (notes.length === 0) {
                container.innerHTML = `
                    <div class="text-center p-4">
                        <p>No notes found. Create your first note!</p>
                    </div>
                `;
                return;
            }

            notes.forEach((note) => {
                const noteCard = createNoteCard(note);
                container.appendChild(noteCard);
            });

            if (isDashboard && notes.length === 9) {
                const arrowButton = document.createElement('div');
                arrowButton.className = 'dashboard-arrow-redirect';
                arrowButton.innerHTML = `
                    <i class="bi bi-arrow-right"></i>
                    <div class="dashboard-arrow-tooltip">Xem tất cả ghi chú</div>
                `;

                arrowButton.onclick = (e) => {
                    e.preventDefault();
                    arrowButton.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        window.location.href = '/all-my-notes';
                    }, 150);
                };

                container.appendChild(arrowButton);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    Error loading notes. Please try again.
                    <button class="btn btn-link" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    const sharedContainer = document.getElementById('sharedNotesContainer');
    const iSharedDashboard = sharedContainer.classList.contains('dashboard-shared-container');
    async function fetchSharedNotes() {
        try {
            const limit = sharedContainer.getAttribute('data-limit') ? parseInt(sharedContainer.getAttribute('data-limit')) : 9;
            const byMe = sharedContainer.getAttribute('data-by-me') ? parseInt(sharedContainer.getAttribute('data-by-me')) : 0;
            const response = await fetch(`/api/shared-notes?limit=${limit}&byMe=${byMe}`);
            const result = await response.json();
            const notes = result.data || [];

            console.log(result);

            sharedContainer.innerHTML = '';

            const existingArrow = document.querySelector('dashboard-shared-arrow-redirect');
            if (existingArrow) {
                existingArrow.remove();
            }

            if (notes.length === 0) {
                sharedContainer.innerHTML = `
                    <div class="text-center p-4">
                        <p>No notes found. No body share note for you!</p>
                    </div>
                `;
                return;
            }

            notes.forEach((note) => {
                const noteCard = createSharedNoteCard(note);
                sharedContainer.appendChild(noteCard);
            });

            if (iSharedDashboard && notes.length === 9) {
                const arrowButton = document.createElement('div');
                arrowButton.className = 'dashboard-shared-arrow-redirect';
                arrowButton.innerHTML = `
                    <i class="bi bi-arrow-right"></i>
                    <div class="dashboard-arrow-tooltip">Xem tất cả ghi chú đã chia sẽ với bạn</div>
                `;

                arrowButton.onclick = (e) => {
                    e.preventDefault();
                    arrowButton.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        window.location.href = '/share-with-me';
                    }, 150);
                };

                sharedContainer.appendChild(arrowButton);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            sharedContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading notes. Please try again.
                    <button class="btn btn-link" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    window.addEventListener('popstate', function (event) {
        fetchNotes(1);
        fetchSharedNotes(1);
    });

    fetchNotes();
    fetchSharedNotes();
});
