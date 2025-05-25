document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('myNotesContainer');
    const colorFilter = document.getElementById('colorFilter');
    const dateFilter = document.getElementById('dateFilter');
    const paginationContainer = document.querySelector('.pagination-container');
    const currentPageInfo = document.getElementById('currentPageInfo');
    const totalPagesInfo = document.getElementById('totalPagesInfo');
    let currentPage = 1;

    function createNoteCard(note) {
        const MAX_TITILE_LEN = 10;
        const title = note.title || 'Untitled';
        const truncatedTitle = title.length > MAX_TITILE_LEN ?
                                title.slice(0, MAX_TITILE_LEN) + '...' :
                                title;

        const deletedAt = note.deleted_at ? new Date(note.deleted_at) : new Date();
        const now = new Date();
        const deletedDaysAgo = Math.floor((now - deletedAt) / (1000 * 60 * 60 * 24));
        const remainDays = 30 - deletedDaysAgo;

        const noteCard = document.createElement('div');
        noteCard.className = `card-shared ${note.color} d-flex flex-column justify-content-between position-relative p-3`;

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
            <strong class="d-inline-block"><em>${truncatedTitle}</em></strong>
            <div class="d-flex flex-column align-items-start mt-3">
                <div>
                    ${tagsHtml}
                </div>
                <span class="fst-italic mt-4" style="font-size: 14px;">
                    <img src="/static/images/clock.png" alt="Clock" style="width: 22px;">
                    Deleted ${deletedDaysAgo} days ago
                </span>
                <span class="fst-italic mt-2" style="font-size: 14px;">
                    <img src="/static/images/error.png" alt="Error" style="width: 22px;">
                    Will be permanently deleted in ${remainDays} days
                </span>
            </div>
            <div class="d-flex" style="position: absolute; top: 12px; right: 12px;">
                <span class="fst-italic p-1 restore-note" style="font-size: 12px; border-radius: 20px; background: #007BFF; color: white; cursor: pointer;">
                    <img src="/static/images/rotate.png" alt="Restore" style="width: 18px;">
                    Restore
                </span>
                <span class="fst-italic p-1 ms-2 delete-note" style="font-size: 12px; border-radius: 20px; background: #FC0004CF; color: white; cursor: pointer;">
                    <img src="/static/images/delete.png" alt="Delete" style="width: 18px;">
                    Delete
                </span>
            </div>
        </div>
        `;

        noteCard.querySelector('.restore-note').addEventListener('click', async function (e) {
            e.preventDefault();
            if (confirm("Bạn có chắc sẽ khôi phục ghi chú này không?")) {
                await restoreNote(note.id);
                fetchPagedNotes(currentPage);
            }
        });
    
        noteCard.querySelector('.delete-note').addEventListener('click', async function (e) {
            e.preventDefault();
            if (confirm("Bạn có chắc chắn xóa vĩnh viễn ghi chú này không?")) {
                await deleteNote(note.id);
                fetchPagedNotes(currentPage);
            }
        });

        return noteCard;
    }
    
    async function restoreNote(noteId) {
        try {
            const response = await fetch(`/api/notes/${noteId}/restore`, { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                alert("Ghi chú đã được khôi phục!");
            } else {
                alert("Không thể khôi phục.");
            }
        } catch (error) {
            console.error('Error restoring note:', error);
            alert("Đã xảy ra lỗi khi khôi phục.");
        }
    }

    async function deleteNote(noteId) {
        try {
            const response = await fetch(`/api/notes/${noteId}/delete`, { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                alert("Ghi chú đã được xóa vĩnh viễn!");
            } else {
                alert("Không thể xóa ghi chú.");
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert("Đã xảy ra lỗi khi xóa.");
        }
    }

    // Hàm fetch notes với phân trang
    async function fetchPagedNotes(page = 1) {
        try {
            const color = colorFilter.value;
            const date = dateFilter.value;
            
            const url = `/api/notes-paginate?page=${page}&limit=15&is_trashed=True${color ? `&color=${color}` : ''}${date ? `&date=${date}` : ''}`;
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
                paginationContainer.style.display = 'none';
            } else {
                data.notes.forEach(note => {
                    container.appendChild(createNoteCard(note));
                });
                // Chỉ hiển thị pagination khi có nhiều hơn 1 trang
                paginationContainer.style.display = data.total_pages > 1 ? 'block' : 'none';
            }

            // Cập nhật thông tin trang
            currentPageInfo.textContent = data.page;
            totalPagesInfo.textContent = data.total_pages;

            // Cập nhật phân trang
            updatePagination(data.page, data.total_pages);
            currentPage = data.page;

        } catch (error) {
            console.error('Error:', error);
            container.innerHTML = '<div class="alert alert-danger">Error loading notes</div>';
            paginationContainer.style.display = 'none';
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

        // Logic hiển thị số trang
        const maxVisiblePages = 2; // Số trang tối đa hiển thị
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
                fetchPagedNotes(1);
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
                fetchPagedNotes(i);
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
                fetchPagedNotes(totalPages);
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