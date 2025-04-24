document.addEventListener('DOMContentLoaded', () => {
    const holder = document.getElementById('editorjs');
    if (!holder) {
        console.error('Editor holder element not found');
    } else {
        let noteData = {};
        try {
            noteData = JSON.parse(holder.dataset.noteContent || '{}');
        } catch (e) {
            console.error('Invalid JSON in data-note-content', e);
        }

        const apiEndpoint = holder.dataset.apiEndpoint;
        const userId      = holder.dataset.userId;

        let tags = [];
        let selectedColor = holder.dataset.noteColor || 'note-green';
        if(holder.dataset.noteTags) {
            try {
                const parsed = JSON.parse(holder.dataset.noteTags);
                tags = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('Invalid JSON in data-note-tags', e);
            }
        }

        const tagsContainer = document.getElementById('tags-container');
        const tagInput = document.getElementById('tag-input');
        const colorPicker = document.getElementById('color-picker');

        function renderTags() {
            if (!tagsContainer) return;
            tagsContainer.innerHTML = tags.map(tag =>
                `<span class="tag">${tag}
                    <i class="remove-tag bi bi-x-circle-fill" data-tag="${tag}"></i>
                </span>`
            ).join('');
        }

        function renderColorPicker() {
            if (!colorPicker) return;
            Array.from(colorPicker.children).forEach(e1 => {
                e1.classList.toggle('selected', e1.dataset.color === selectedColor);
            });
        }

        if (tagInput && tagsContainer) {
            tagInput.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (tagInput.value.trim()) {
                        const t = tagInput.value.trim();
                        if (!tags.includes(t)) tags.push(t);
                        tagInput.value = '';
                        renderTags();
                    }
                }
            });

            tagsContainer.addEventListener('click', e => {
                if (e.target && e.target.classList.contains('remove-tag')) {
                    tags = tags.filter(t => t !== e.target.dataset.tag);
                    renderTags();
                }
            });
        }

        if (colorPicker) {
            colorPicker.addEventListener('click', e => {
                if (e.target && e.target.classList.contains('color-option')) {
                    selectedColor = e.target.dataset.color;
                    renderColorPicker();
                }
            });
        }

        renderTags();
        renderColorPicker();

        const editor = new EditorJS({
            holder:       'editorjs',
            autofocus:    true,
            data:         noteData,
            tools: {
                header:     { class: Header,       inlineToolbar: ['link'] },
                list:       { class: EditorjsList, inlineToolbar: true, config: { defaultStyle: 'unordered' } },
                paragraph:  { class: Paragraph,    inlineToolbar: true },
                table:      Table,
                codeBox:    { class: CodeBox, config: {
                                themeURL:       'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/github.min.css',
                                themeName:      'github',
                                useDefaultTheme:'light'
                            }
                },
                math:       MathTex,
                Marker:     Marker,
                inlineCode: InlineCode
            },
            placeholder: "Write notes here..."
        });

        let saveInProgress = false;
        async function doSave() {
            if (saveInProgress) return;
            saveInProgress = true;
            try {
                const output = await editor.save();
                const title  = document.getElementById('page-title')?.textContent.trim() || '';
                const payload = { 
                    title, content: output,
                    color: selectedColor,
                    tags:  tags, 
                    user_id: userId
                };

                const resp = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!resp.ok) throw new Error(`Save failed: ${resp.status}`);
                const data = await resp.json();
                if (data.note_id) {
                    window.location.href = `/edit-note/${data.note_id}`;
                }
                console.log('Saved successfully');
            } catch (err) {
                console.error('Save error:', err);
            } finally {
                saveInProgress = false;
            }
        }

        // Lưu khi nhấn Ctrl+S / Cmd+S
        window.addEventListener('keydown', async e => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                await doSave();
            }
        });

        // Auto-save mỗi 60s, và clear khi thoát trang
        const autoSaveInterval = setInterval(doSave, 60000);
        window.addEventListener('beforeunload', () => clearInterval(autoSaveInterval));

        // Hàm xuất PDF
        async function exportPDF(blocks, title) {
            const response = await fetch('/api/export-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocks, title })
            });
            if (!response.ok) throw new Error(`Export PDF failed: ${response.status}`);
            const blob = await response.blob();
            const url  = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href     = url;
            link.download = 'note.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
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
    }
});