document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('myNotesContainer');
    const colorFilter = document.getElementById('colorFilter');
    const dateFilter = document.getElementById('dateFilter');
    let currentPage = 1;

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
                    ${tagsHtml}
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

        const deleteButton = noteCard.querySelector('.dropdown-item.text-danger');
        deleteButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (confirm('Bạn có chắc chắn muốn đưa ghi chú này vào Trash không?')) {
                fetch(`/api/notes/${note.id}/move-to-trash`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Đã chuyển ghi chú vào Trash!');
                        fetchPagedNotes(1); // Reload lại danh sách
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

        return noteCard;
    }
    
    // Hàm fetch notes với phân trang
    async function fetchPagedNotes(page = 1) {
        try {
            const color = colorFilter.value;
            const date = dateFilter.value;
            
            const url = `/api/notes-paginate?page=${page}&limit=15${color ? `&color=${color}` : ''}${date ? `&date=${date}` : ''}`;
            const response = await fetch(url);
            const result = await response.json();
            const data = result.data;

            // Hiển thị notes
            container.innerHTML = '';
            if (data.notes.length === 0) {
                container.innerHTML = `
                    <div class="text-center p-4">
                        <p>No notes found.</p>
                    </div>
                `;
            } else {
                data.notes.forEach(note => {
                    container.appendChild(createNoteCard(note));
                });
            }

            // Cập nhật phân trang
            updatePagination(data.page, data.total_pages);
            currentPage = data.page;

        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<div class="alert alert-danger">Error loading notes</div>';
        }
    }

    // Hàm cập nhật phân trang
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
                fetchPagedNotes(currentPage - 1);
            };
        }
        pagination.appendChild(prevLi);

        // Các số trang
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.onclick = (e) => {
                e.preventDefault();
                fetchPagedNotes(i);
            };
            pagination.appendChild(li);
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
                fetchPagedNotes(currentPage + 1);
            };
        }
        pagination.appendChild(nextLi);
    }

    // Xử lý sự kiện thay đổi filter
    colorFilter.addEventListener('change', () => fetchPagedNotes(1));
    dateFilter.addEventListener('change', () => fetchPagedNotes(1));

    // Khởi tạo trang đầu tiên
    fetchPagedNotes(1);
});