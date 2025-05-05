document.addEventListener('DOMContentLoaded', function () {
    const notesContainer = document.getElementById('publicNotesContainer');
    const searchInput = document.getElementById('searchPublicNotes');
    const paginationContainer = document.querySelector('.pagination-container');
    const currentPageInfo = document.getElementById('currentPageInfo');
    const totalPagesInfo = document.getElementById('totalPagesInfo');
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

            // Update page info
            currentPageInfo.textContent = page;
            totalPagesInfo.textContent = totalPages;

            // Show/hide pagination container
            if (totalPages <= 1) {
                paginationContainer.style.display = 'none';
            } else {
                paginationContainer.style.display = 'block';
            }

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
                
                const MAX_TITILE_LEN = 25;
                const title = note.title || 'Untitled';
                const truncatedTitle = title.length > MAX_TITILE_LEN ?
                                        title.slice(0, MAX_TITILE_LEN) + '...' :
                                        title;

                const keywords = Array.isArray(note.tags) ? note.tags : [];
                const maxTags = 5;
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
                        <div class="mt-2">
                            ${tagsHtml}
                        </div>
        
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
        const pagination = document.querySelector('.custom-pagination');
        pagination.innerHTML = '';

        // Nút Previous
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

        // Logic hiển thị số trang
        const maxVisiblePages = 5; // Số trang tối đa hiển thị
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Điều chỉnh startPage nếu endPage đã đạt giới hạn
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Thêm nút First Page nếu không ở trang đầu
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = '<a class="page-link" href="#">1</a>';
            firstLi.onclick = (e) => {
                e.preventDefault();
                fetchPublicNotes(1, searchInput.value.trim());
            };
            pagination.appendChild(firstLi);

            // Thêm dấu ... nếu có khoảng trống
            if (startPage > 2) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsisLi);
            }
        }

        // Các số trang
        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.onclick = (e) => {
                e.preventDefault();
                fetchPublicNotes(i, searchInput.value.trim());
            };
            pagination.appendChild(li);
        }

        // Thêm nút Last Page nếu không ở trang cuối
        if (endPage < totalPages) {
            // Thêm dấu ... nếu có khoảng trống
            if (endPage < totalPages - 1) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsisLi);
            }

            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
            lastLi.onclick = (e) => {
                e.preventDefault();
                fetchPublicNotes(totalPages, searchInput.value.trim());
            };
            pagination.appendChild(lastLi);
        }

        // Nút Next
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