console.log('global_search.js loaded');

document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('globalSearchForm');
    const searchInput = document.getElementById('globalSearchInput');

    if (!searchForm || !searchInput) {
        console.warn('Global search form/input not found in DOM.');
        return;
    }

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length === 0) return;

        const path = window.location.pathname;

        if (path.startsWith('/all-my-notes')) {
            // ✅ Giữ logic tìm kiếm nội bộ
            fetch(`/api/notes-paginate?page=1&limit=15&search=${encodeURIComponent(searchTerm)}`)
                .then(res => res.json())
                .then(data => {
                    const notes = data.data?.notes || [];
                    renderNotes(notes);
                })
                .catch(err => {
                    console.error('Error fetching personal notes:', err);
                    const container = document.getElementById('myNotesContainer');
                    if (container) {
                        container.innerHTML = `<p class="text-danger">Error loading search results.</p>`;
                    }
                });
        } else {
            // ✅ Các trang khác → redirect sang public notes
            window.location.href = `/public-notes?search=${encodeURIComponent(searchTerm)}`;
        }
    });
});

function renderNotes(notes) {
    const container = document.getElementById('myNotesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (notes.length === 0) {
        container.innerHTML = `<p class="text-muted text-center">No notes found.</p>`;
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = `note-card ${note.color || 'note-green'} p-3 mb-3`;
        card.setAttribute('data-note-id', note.id);

        
        let rawContent = '';
        if (typeof note.content === 'string') {
            rawContent = note.content;
        } else if (note.content?.blocks) {
            rawContent = note.content.blocks
                .map(block => block.data?.text || '')
                .join(' ');
        }

        card.innerHTML = `
            <strong><em>${note.title}</em></strong>
            <p class="mt-2">${rawContent.substring(0, 60)}...</p>
        `;

        card.addEventListener('click', () => {
            window.location.href = `/edit-note/${note.id}`;
        });

        container.appendChild(card);
    });
}
