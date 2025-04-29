import matplotlib
# Sử dụng backend không cần GUI
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from markupsafe import Markup, escape
import io
import base64

def latex_to_img(latex: str) -> str:
    # Cấu hình mathtext
    fig = plt.figure()
    fig.patch.set_alpha(0)
    text = fig.text(0, 0, f"${latex}$", fontsize=20)
    fig.canvas.draw()
    bbox = text.get_window_extent()
    width, height = bbox.width / fig.dpi, bbox.height / fig.dpi
    fig.set_size_inches((width, height))
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=400,
                bbox_inches='tight', pad_inches=0)
    plt.close(fig)
    data = base64.b64encode(buf.getvalue()).decode('utf-8')
    return (
        f'<img src="data:image/png;base64,{data}" '
        f'alt="{escape(latex)}" '
        f'style="height:4em;"/>'
    )

def blocks_to_html(blocks):
    parts = []
    for b in blocks:
        t = b.get('type'); d = b.get('data', {})
        if t == 'header':
            lvl, txt = d.get('level',1), escape(d.get('text',''))
            parts.append(f'<h{lvl}>{txt}</h{lvl}>')
        elif t == 'paragraph':
            raw = d.get('text','').strip()
            if raw:
                parts.append(f'<p>{Markup(raw)}</p>')
        elif t == 'list':
            style, items = d.get('style','unordered'), d.get('items',[])
            if style == 'checklist':
                lis = ''.join(
                    f'<li>{"☑" if itm.get("meta",{}).get("checked") else "☐"} '
                    f'{escape(itm.get("content",""))}</li>'
                    for itm in items
                )
                parts.append(f'<ul class="checklist">{lis}</ul>')
            else:
                tag = 'ol' if style=='ordered' else 'ul'
                lis = ''.join(
                    f'<li>{Markup(itm.get("content") if isinstance(itm,dict) else itm)}</li>'
                    for itm in items
                )
                parts.append(f'<{tag}>{lis}</{tag}>')
        elif t == 'codeBox':
            parts.append(
                '<pre class="code-block"><code>'
                f'{Markup(d.get("code",""))}'
                '</code></pre>'
            )
        elif t == 'inlineCode':
            code = escape(d.get('code',''))
            parts.append(f'<code class="inline-code">{code}</code>')
        elif t == 'math':
            latex = d.get('text','').strip()
            if latex:
                try:
                    img = latex_to_img(latex)
                    parts.append(f'<span class="math">{img}</span>')
                except Exception:
                    parts.append(f'<em>{escape(latex)}</em>')
        elif t == 'table':
            content, wh = d.get('content',[]), d.get('withHeadings',False)
            rows = ''
            for i,row in enumerate(content):
                cells = ''
                for cell in row:
                    esc = escape(str(cell))
                    cells += f'<th>{esc}</th>' if i==0 and wh else f'<td>{esc}</td>'
                rows += f'<tr>{cells}</tr>'
            parts.append(f'<table>{rows}</table>')
    return '\n'.join(parts)