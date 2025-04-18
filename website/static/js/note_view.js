const holder = document.getElementById('editorjs');
const rawContent = holder.dataset.noteContent;
const apiEndpoint = holder.dataset.apiEndpoint;
const userId = holder.dataset.userId;

let noteData = JSON.parse(rawContent);

const editor = new EditorJS({
    holder: 'editorjs',
    autofocus: true,
    data: noteData,
    tools: {
        header: {
            class: Header,
            inlineToolbar: ['link']
        },
        list: {
            class: EditorjsList,
            inlineToolbar: true,
            config: {
                defaultStyle: 'unordered'
            }
        },
        paragraph: {
            class: Paragraph,
            inlineToolbar: true
        },
        table: Table,
        codeBox: {
            class: CodeBox,
            config: {
                themeURL: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.18.1/build/styles/github.min.css',
                themeName: 'github',
                useDefaultTheme: 'light'
            }
        },
        math: MathTex,
        Marker: Marker,
        inlineCode: InlineCode
    },
    
    placeholder: "Write notes here..."
});

async function doSave() {
    try {
        const output = await editor.save();
        const title   = document.getElementById('page-title').textContent.trim();
        const payload = {
            title:   title,
            content: output,
            user_id: userId
        };

        const resp = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await resp.json();

        if (data.note_id) {
            window.location.href = `/edit-note/${data.note_id}`;;
        }

        console.log('Saved');
    } catch(err) {
        console.error('Save error:', err);
    }
}

window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        doSave();
    }
});

setInterval(doSave, 60000);