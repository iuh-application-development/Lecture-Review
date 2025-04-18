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
    const shareButton = document.getElementById('shareNoteBtn');
    console.log('Checking shareNoteBtn:', shareButton);
    if (shareButton) {
        console.log('shareNoteBtn found, attaching event listener');
        shareButton.addEventListener('click', shareNote);
    } else {
        console.log('shareNoteBtn not found - this is normal for pages without share modal');
    }

    // Logic cho myNotesContainer (dashboard hoặc all_my_notes)
    const container = document.getElementById('myNotesContainer');

    // Định nghĩa hàm createNoteCard
    function createNoteCard(note) {
        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.color} position-relative p-3`;

        const truncatedContent = note.content.length > 50
            ? note.content.substring(0, 50) + '...'
            : note.content;

        noteCard.innerHTML = `
            <div class="note-content">
                <div class="note-header d-flex justify-content-between align-items-start pb-1">
                    <strong><em>${note.title}</em></strong>
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
                <p class="mt-2">${truncatedContent}</p>
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

    function updatePagination(currentPage, totalPages) {
        const paginationContainer = document.querySelector('.pagination.custom-pagination');
        if (!paginationContainer) return;

        paginationContainer.innerHTML = '';

        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage <= 1 ? 'disabled' : ''}`;
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.innerHTML = '<i class="bi bi-chevron-left"></i>';
        prevLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                fetchNotes(currentPage - 1);
            }
        });
        prevLi.appendChild(prevLink);
        paginationContainer.appendChild(prevLi);

        for (let page = 1; page <= totalPages; page++) {
            const li = document.createElement('li');
            li.className = `page-item ${page === currentPage ? 'active' : ''}`;
            const link = document.createElement('a');
            link.className = 'page-link';
            link.href = '#';
            link.textContent = page;
            link.addEventListener('click', function (e) {
                e.preventDefault();
                fetchNotes(page);
            });
            li.appendChild(link);
            paginationContainer.appendChild(li);
        }

        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage >= totalPages ? 'disabled' : ''}`;
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.innerHTML = '<i class="bi bi-chevron-right"></i>';
        nextLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                fetchNotes(currentPage + 1);
            }
        });
        nextLi.appendChild(nextLink);
        paginationContainer.appendChild(nextLi);
    }

    window.addEventListener('popstate', function (event) {
        fetchNotes(1);
    });

    fetchNotes();
});
