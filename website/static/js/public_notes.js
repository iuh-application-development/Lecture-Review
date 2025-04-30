document.addEventListener('DOMContentLoaded', function () {
    const notesContainer = document.getElementById('publicNotesContainer');
    const searchInput = document.getElementById('searchPublicNotes');
    let currentPage = 1;
    const limit = 15;

    // Lấy tham số search từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialSearch = urlParams.get('search') || '';

    async function fetchPublicNotes(page = 1, search = '') {
        try {
            const url = search 
                ? `/api/public-notes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
                : `/api/public-notes?page=${page}&limit=${limit}`;
            console.log('Fetching public notes from:', url);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            const notes = result.data || [];
            const totalPages = result.pages || 1;

            notesContainer.innerHTML = '';
            if (notes.length === 0) {
                notesContainer.innerHTML = `
                    <div class="text-center w-100 p-4">
                        <p class="text-muted">Not found</p>
                    </div>
                `;
                updatePagination(page, totalPages);
                return;
            }

            notes.forEach(note => {
                const noteCard = document.createElement('div');
                noteCard.className = `note-card ${note.color || 'note-green'} position-relative p-3`;
                
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
                                </ul>
                            </div>
                        </div>
                        <div class="card-separator"></div>
                        <p class="mt-2">${truncatedContent}</p>
                        <small class="text-muted">Created: ${new Date(note.created_at).toLocaleString('vi-VN')}</small>
                    </div>
                `;

                noteCard.addEventListener('click', function (e) {
                    if (!e.target.closest('.dropdown')) {
                        window.location.href = `/edit-note/${note.id}?view_only=true&from=public`; 
                    }
                });

                const shareButton = noteCard.querySelector('.share-note');
                shareButton.addEventListener('click', function (e) {
                    e.preventDefault();
                    const noteId = this.getAttribute('data-note-id');
                    document.getElementById('noteIdToShare').value = noteId;
                });

                notesContainer.appendChild(noteCard);
            });

            updatePagination(page, totalPages);
        } catch (error) {
            console.error('API error: Error fetching public notes', error);
            notesContainer.innerHTML = `
                <div class="text-center w-100 p-4">
                    <p class="text-danger">Error loading public notes. Please try again.</p>
                </div>
            `;
        }
    }

    function updatePagination(currentPage, totalPages) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage <= 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" ${currentPage <= 1 ? 'tabindex="-1"' : ''}>
                <i class="bi bi-chevron-left"></i>
            </a>
        `;
        if (currentPage > 1) {
            prevLi.onclick = (e) => {
                e.preventDefault();
                fetchPublicNotes(currentPage - 1, searchInput.value.trim());
            };
        }
        pagination.appendChild(prevLi);

        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageItem.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                fetchPublicNotes(currentPage, searchInput.value.trim());
            });
            pagination.appendChild(pageItem);
        }

        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage >= totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" ${currentPage >= totalPages ? 'tabindex="-1"' : ''}>
                <i class="bi bi-chevron-right"></i>
            </a>
        `;
        if (currentPage < totalPages) {
            nextLi.onclick = (e) => {
                e.preventDefault();
                fetchPublicNotes(currentPage + 1, searchInput.value.trim());
            };
        }
        pagination.appendChild(nextLi);
    }

    if (searchInput) {
        searchInput.value = initialSearch;
        searchInput.addEventListener('input', debounce(function () {
            currentPage = 1;
            fetchPublicNotes(currentPage, searchInput.value.trim());
        }, 500));
    }

    fetchPublicNotes(currentPage, initialSearch);

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});