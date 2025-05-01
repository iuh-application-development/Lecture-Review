console.log('note_functions.js executing');

document.addEventListener('DOMContentLoaded', function () {
    console.log('note_functions.js DOMContentLoaded');

    const sharedContainer = document.getElementById('sharedNotesContainer');
    const byMe = sharedContainer.getAttribute('data-by-me') ? parseInt(sharedContainer.getAttribute('data-by-me')) : 0;

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

    function convertDatetime(utc) {
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

        return updatedStr;
    }

    // Định nghĩa hàm createSharedNoteCard
    function createSharedNoteCard(share_note) {
        const MAX_TITILE_LEN = 25;
        const title = share_note.title || 'Untitled';
        const truncatedTitle = title.length > MAX_TITILE_LEN ?
                                title.slice(0, MAX_TITILE_LEN) + '...' :
                                title;

        const message = share_note.message;

        const updatedStr = convertDatetime(share_note.updated_at);
        const sharedStr = convertDatetime(share_note.share_at);

        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${share_note.color} position-relative p-3`;

        const keywords = Array.isArray(share_note.tags) ? share_note.tags : [];
        const maxTags = 5; // số lượng tags tối đa hiển thị
        let tagsHtml = '';

        if (keywords.length > maxTags) {
            tagsHtml = keywords.slice(0, maxTags).map(k => `
                <span class="badge bg-secondary me-1">${k.length > 10 ? k.slice(0, 7) + '...' : k}</span>
            `).join("");
            tagsHtml += `<span class="badge bg-light text-dark">+${keywords.length - maxTags} more</span>`;
        } else {
            tagsHtml = keywords.map(k => `
                <span class="badge bg-secondary me-1">${k.length > 10 ? k.slice(0, 7) + '...' : k}</span>
            `).join("");
        }

        noteCard.innerHTML = `
            <div class="note-content">
                <div class="note-header d-flex justify-content-between align-items-start pb-1">
                    <strong class="d-inline-block"><em>${truncatedTitle}</em></strong>
                    ${byMe ?
                    `<div class="dropdown">
                        <button class="btn btn-link p-0 border-0" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        
                        <ul class="dropdown-menu dropdown-menu-end">
                            
                                <li><a class="dropdown-item share-note" href="#" data-bs-toggle="modal" data-bs-target="#shareNoteModal" data-note-id="${share_note.note_id}">
                                <i class="bi bi-share"></i> Share</a></li>
                                <li><a class="dropdown-item text-danger" href="#">
                                <i class="bi bi-trash"></i> Delete</a></li>
                        </ul>
                    </div>`:``
                    }
                </div>
                <div class="card-separator"></div>
                
                ${message ? `
                    <div class="alert alert-info p-2 mb-2" role="alert" style="font-size: 13px;"> 
                        💌 ${message}
                    </div>
                    ` : ''}

                </div>
                <div class="mt-2">
                    ${tagsHtml}
                </div>

                <small class="text-muted">Last updated: ${updatedStr}</small>
                <br/>
                <small class="text-muted">Shared at: ${sharedStr}</small>
                <br/>
                <p class="fst-italic">
                    ${byMe ? 
                        `<small class="fst-italic">Shared to ${share_note.recipient}</small>` : 
                        `<small class="fst-italic">Shared by ${share_note.sharer}</small>`}
                </p>
            </div>
        `;

        noteCard.addEventListener('click', function (e) {
            if (!e.target.closest('.dropdown')) {
                window.location.href = `/edit-note/${share_note.note_id}`;
            }
        });

        const shareButton = noteCard.querySelector('.share-note');
        if (shareButton) {
            shareButton.addEventListener('click', function (e) {
                e.preventDefault();
                const noteId = this.getAttribute('data-note-id');
                document.getElementById('noteIdToShare').value = noteId;
            });
        }

        if (byMe) {
            const deleteButton = noteCard.querySelector('.dropdown-item.text-danger');
            deleteButton.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (confirm('Bạn có chắc chắn muốn đưa ghi chú này vào Trash không?')) {
                    fetch(`/api/notes/${share_note.note_id}/move-to-trash`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Đã chuyển ghi chú vào Trash!');
                            fetchSharedNotes(); // Reload lại danh sách
                        } else {
                            alert('Thao tác thất bại: ' + (data.message || 'Unknown error.'));
                        }
                    })
                    .catch(error => {
                        console.error('Error moving note to trash:', error);
                        alert('Đã xảy ra lỗi.');
                    });
                }
            });
        }
        return noteCard;
    }

    async function fetchSharedNotes() {
        try {
            const limit = sharedContainer.getAttribute('data-limit') ? parseInt(sharedContainer.getAttribute('data-limit')) : 9;
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
                const { blocks } = await editor.save();
                const title = document.getElementById('page-title')?.textContent.trim() || '';
                await exportPDF(blocks, title);
            } catch (err) {
                console.error('Export PDF error:', err);
            }
        });
    } else {
        console.warn('Export PDF button not found');
    }

    window.addEventListener('popstate', function (event) {
        fetchSharedNotes(1);
    });

    fetchSharedNotes();
});
