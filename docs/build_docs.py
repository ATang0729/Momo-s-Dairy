"""Build the two self-contained reading pages from their Markdown sources.

Uses only the Python standard library; no build step is needed to view the output.
"""
from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parent


def inline(text):
    text = html.escape(text)
    text = re.sub(r"\[([^\]]+)\]\(([^\)]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    return text


def render(source, aliases=None):
    lines = source.splitlines()
    parts, toc = [], []
    index = 0
    section_number = 0
    while index < len(lines):
        line = lines[index].strip()
        if not line or line.startswith("# "):
            index += 1
            continue
        if line.startswith("## "):
            section_number += 1
            title = line[3:]
            anchor = f"section-{section_number}"
            alias = (aliases or {}).get(section_number)
            if alias:
                parts.append(f'<span id="{alias}" class="anchor-alias" aria-hidden="true"></span>')
            parts.append(f'<h2 id="{anchor}">{inline(title)}</h2>')
            toc.append((anchor, title))
        elif line.startswith("### "):
            parts.append(f"<h3>{inline(line[4:])}</h3>")
        elif line.startswith("> "):
            quote = []
            while index < len(lines) and lines[index].startswith("> "):
                quote.append(inline(lines[index][2:].strip()))
                index += 1
            parts.append('<div class="document-meta">' + "<br>".join(quote) + "</div>")
            continue
        elif line.startswith("|"):
            rows = []
            while index < len(lines) and lines[index].strip().startswith("|"):
                cells = [cell.strip() for cell in lines[index].strip().strip("|").split("|")]
                if not all(re.fullmatch(r"[:\- ]+", cell) for cell in cells):
                    rows.append(cells)
                index += 1
            head = "".join(f"<th scope=\"col\">{inline(cell)}</th>" for cell in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(cell)}</td>" for cell in row) + "</tr>" for row in rows[1:])
            parts.append(f'<div class="table-scroll" tabindex="0" role="region" aria-label="可横向滚动的数据表"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>')
            continue
        elif line.startswith("- ") or re.match(r"\d+\. ", line):
            ordered = bool(re.match(r"\d+\. ", line))
            items = []
            pattern = r"\d+\. " if ordered else r"- "
            while index < len(lines) and re.match(pattern, lines[index].strip()):
                items.append("<li>" + inline(re.sub("^" + pattern, "", lines[index].strip())) + "</li>")
                index += 1
            tag = "ol" if ordered else "ul"
            parts.append(f"<{tag}>" + "".join(items) + f"</{tag}>")
            continue
        else:
            paragraph = [line]
            index += 1
            while index < len(lines) and lines[index].strip() and not re.match(r"^(#|>|\||- |\d+\. )", lines[index].strip()):
                paragraph.append(lines[index].strip())
                index += 1
            parts.append("<p>" + inline(" ".join(paragraph)) + "</p>")
            continue
        index += 1
    return "\n".join(parts), toc


PAGES = [
    {
        "source": "用户洞察报告.md", "file": "report.html", "label": "用户洞察报告", "en": "RESEARCH & INSIGHTS",
        "title": "在情绪最满的时候，<br>给表达留一点<span>空白。</span>",
        "intro": "从求职压力出发，理解表达、比较与求助之间的拉扯。每一项设计取舍，都能追溯到具体的用户需求与证据边界。",
        "number": "01", "other": "prd.html", "other_label": "阅读产品需求文档", "tag": "研究输入 · 设计推导 · 验证计划",
    },
    {
        "source": "PRD.md", "file": "prd.html", "label": "产品需求文档", "en": "PRODUCT REQUIREMENTS",
        "title": "先写一句，<br>再决定<span>下一步。</span>",
        "intro": "一套可以动手体验、可以逐项验收的原型范围。让记录足够轻，让 AI 由用户发起，让每个建议都有明确的边界。",
        "number": "02", "other": "report.html", "other_label": "回到用户洞察报告", "tag": "产品范围 · 交互规则 · 交付验收",
        "aliases": {2: "positioning", 7: "risks"},
    },
]

for page in PAGES:
    body, toc = render((ROOT / page["source"]).read_text(), page.get("aliases"))
    nav = "".join(f'<a href="#{anchor}">{inline(title)}</a>' for anchor, title in toc)
    result = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#f6f4ed">
  <meta name="description" content="Momo 默默的{page['label']}：求职场景中的轻量情绪记录与按需自助支持。">
  <title>{page['label']} · Momo 默默</title>
  <link rel="stylesheet" href="docs.css">
</head>
<body>
<a class="skip" href="#document">跳转到文档正文</a>
<header class="topbar">
  <a class="brand" href="../index.html" aria-label="返回 Momo 默默原型"><span class="brand-mark">m.</span><span>Momo <small>默默</small></span></a>
  <nav aria-label="交付导航"><a href="../index.html">体验原型 <span aria-hidden="true">↗</span></a><a href="../prototypes.html">原型图</a><a class="download" href="{page['source']}" download>下载文档 <span aria-hidden="true">↓</span></a></nav>
</header>
<main>
  <section class="hero" aria-labelledby="page-title">
    <div class="eyebrow"><span>{page['en']}</span><span>CASE STUDY / {page['number']}</span></div>
    <div class="hero-grid"><div><p class="page-type">{page['label']}</p><h1 id="page-title">{page['title']}</h1><p class="lede">{page['intro']}</p></div><div class="paper-note" aria-hidden="true"><div class="paper-symbol">m.</div><span>把想法轻轻放在这里</span><div class="note-lines"><i></i><i></i><i></i></div><small>YOUR PACE. YOUR SPACE.</small></div></div>
    <div class="hero-foot"><span>{page['tag']}</span><span>V1.0 · OCT 2026</span></div>
  </section>
  <div class="document-layout">
    <aside class="toc" aria-label="文档目录"><p>ON THIS PAGE <span>目录</span></p>{nav}<a class="toc-next" href="{page['other']}">{page['other_label']} ↗</a></aside>
    <article class="document" id="document">{body}
      <div class="end-note"><span>让产品为人留出空间。</span><a href="../index.html">回到原型体验 <span aria-hidden="true">↗</span></a></div>
    </article>
  </div>
</main>
<footer><a href="../index.html">Momo · 默默</a><span>情绪日记与自我关怀 · 静态交互原型</span><a href="#">回到顶部 ↑</a></footer>
</body>
</html>
'''
    (ROOT / page["file"]).write_text(result)
    print(f"Built {page['file']}: {len(toc)} sections")
