console.log('note_functions.js loaded');

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded');
    const container = document.getElementById('myNotesContainer');
    console.log('Container found:', container);
    
    // Định nghĩa hàm createNoteCard trước
    function createNoteCard(note) {
        const noteCard = document.createElement('div');
        noteCard.className = `note-card ${note.color} position-relative p-3`;
        
        // Cắt nội dung nếu dài hơn 50 ký tự
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
                            <li><a class="dropdown-item" href="/note_detail/${note.id}">
                                <i class="bi bi-eye"></i> View Detail</a></li>
                            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" 
                                data-bs-target="#editNoteModal" data-note-id="${note.id}">
                                <i class="bi bi-pencil"></i> Edit</a></li>
                            <li><a class="dropdown-item" href="#">
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

        // Thêm sự kiện click cho card
        noteCard.addEventListener('click', function(e) {
            if (!e.target.closest('.dropdown')) {
                window.location.href = `/note_detail/${note.id}`;
            }
        });

        return noteCard;
    }

    // Kiểm tra xem đang ở trang nào
    const isDashboard = container.classList.contains('dashboard-container');
    
    // Sau đó định nghĩa hàm fetchNotes
    async function fetchNotes() {
        if (!container) return; // Kiểm tra nếu không tìm thấy container

        try {
            const response = await fetch('/api/notes?limit=9');
            const result = await response.json();
            const notes = result.data || [];
            
            container.innerHTML = '';
            
            // Xóa mũi tên cũ nếu có
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

            notes.forEach((note, index) => {
                const noteCard = createNoteCard(note);
                
                // Chỉ thêm mũi tên khi đủ điều kiện:
                // 1. Đang ở trang dashboard
                // 2. Có đúng 9 bài note
                if (isDashboard && index === 6 && notes.length >= 9) {
                    const noteContainer = document.createElement('div');
                    noteContainer.className = 'dashboard-note-container';
                    noteContainer.appendChild(noteCard);
                    
                    const arrow = document.createElement('div');
                    arrow.className = 'dashboard-arrow-redirect';
                    arrow.innerHTML = `
                        <i class="bi bi-arrow-right"></i>
                        <div class="dashboard-arrow-tooltip">Xem tất cả ghi chú</div>
                    `;
                    
                    // Thêm hiệu ứng click
                    arrow.onclick = (e) => {
                        e.preventDefault();
                        arrow.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            window.location.href = '/all-my-notes';
                        }, 150);
                    };
                    
                    noteContainer.appendChild(arrow);
                    container.appendChild(noteContainer);
                } else {
                    container.appendChild(noteCard);
                }
            });

            // Chỉ thêm mũi tên khi đủ điều kiện:
            // 1. Đang ở trang dashboard
            // 2. Có đúng 9 bài note
            if (isDashboard && notes.length === 9) {
                const arrow = document.createElement('div');
                arrow.className = 'dashboard-arrow-redirect';
                arrow.innerHTML = `
                    <i class="bi bi-arrow-right"></i>
                    <div class="dashboard-arrow-tooltip">Xem tất cả ghi chú</div>
                `;
                
                // Thêm hiệu ứng click
                arrow.onclick = (e) => {
                    e.preventDefault();
                    arrow.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        window.location.href = '/all-my-notes';
                    }, 150);
                };
                
                // Thêm vào body
                document.body.appendChild(arrow);

                // Thêm animation xuất hiện
                setTimeout(() => {
                    arrow.style.opacity = '1';
                    arrow.style.transform = 'translateX(0)';
                }, 100);
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

    // Hàm tạo giao diện phân trang
    function updatePagination(currentPage, totalPages) {
        const paginationContainer = document.querySelector('.pagination.custom-pagination');
        paginationContainer.innerHTML = '';

        // Nút Previous
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

        // Các số trang
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

        // Nút Next
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

    // Thêm event listener cho sự kiện popstate (khi người dùng nhấn back/forward)
    window.addEventListener('popstate', function(event) {
        // Load lại notes khi quay lại trang
        fetchNotes(1);
    });

    // Initial load
    fetchNotes(1);
});
