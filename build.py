#!/usr/bin/env python3
"""꿀로그 정적 사이트 빌더: posts/*.md, pages/*.md → site/ HTML"""
import os, re, html
from datetime import datetime
import markdown

BASE = os.path.dirname(os.path.abspath(__file__))
POSTS_DIR = os.path.join(BASE, 'posts')
PAGES_DIR = os.path.join(BASE, 'pages')
OUT = os.path.join(BASE, 'site')
SITE_URL = 'https://ggullog.com'
SITE_NAME = '꿀로그'
SITE_DESC = '복잡한 정보는 줄이고, 꼭 필요한 핵심만 담았습니다. 직접 경험하고 검증한 생활 노하우를 쉽고 간결하게 전해드립니다.'

CATEGORIES = {
    'saving': ('절약·재테크', '돈을 아끼고 불리는 현실적인 노하우'),
    'home': ('살림·청소', '집안일을 효율적으로 만드는 실용적인 팁'),
    'food': ('요리·식재료', '건강하고 맛있는 식탁을 위한 주방 지혜'),
    'digital': ('디지털·생활편의', '스마트한 디지털 생활을 위한 정보'),
}

MD = markdown.Markdown(extensions=['tables', 'toc', 'fenced_code'])

def parse_md(path):
    text = open(path, encoding='utf-8').read()
    m = re.match(r'^---\n(.*?)\n---\n?(.*)$', text, re.S)
    meta = {}
    body = text
    if m:
        for line in m.group(1).split('\n'):
            if ':' in line:
                k, v = line.split(':', 1)
                meta[k.strip()] = v.strip().strip('"')
        body = m.group(2)
    MD.reset()
    meta['html'] = MD.convert(body)
    # reading time: ~500 chars/min for Korean
    chars = len(re.sub(r'\s', '', body))
    meta['reading_min'] = max(1, round(chars / 500))
    meta['chars'] = chars
    return meta

def layout(title, description, content, canonical, active=''):
    nav_items = ''.join(
        f'<a href="/category-{code}.html" class="{"active" if active==code else ""}">{name}</a>'
        for code, (name, _) in CATEGORIES.items())
    return f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description)}">
<link rel="canonical" href="{canonical}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="{SITE_NAME}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/style.css">
<meta name="google-adsense-account" content="ca-pub-8241484658511531">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8241484658511531" crossorigin="anonymous"></script>
</head>
<body>
<header class="site-header">
  <div class="container header-inner">
    <a href="/" class="logo"><span class="logo-mark">꿀</span>로그</a>
    <nav class="main-nav">{nav_items}</nav>

  </div>
</header>
<main class="container">
{content}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-links">
      <a href="/about.html">소개</a>
      <a href="/contact.html">연락처</a>
      <a href="/privacy.html">개인정보처리방침</a>
      <a href="/terms.html">이용약관</a>
    </div>
    <p class="copyright">&copy; 2026 {SITE_NAME} (ggullog.com). All rights reserved.</p>
  </div>
</footer>
</body>
</html>'''

def post_card(p):
    cat_name = CATEGORIES[p['category']][0]
    return f'''<article class="card">
  <a href="/posts/{p['slug']}.html" class="card-link">
    <span class="card-cat">{cat_name}</span>
    <h2 class="card-title">{html.escape(p['title'])}</h2>
    <p class="card-desc">{html.escape(p['description'])}</p>
    <div class="card-meta"><time datetime="{p['date']}">{fmt_date(p['date'])}</time> · {p['reading_min']}분 읽기</div>
  </a>
</article>'''

def fmt_date(d):
    dt = datetime.strptime(d, '%Y-%m-%d')
    return f'{dt.year}년 {dt.month}월 {dt.day}일'

def build():
    os.makedirs(os.path.join(OUT, 'posts'), exist_ok=True)

    posts = []
    for fn in os.listdir(POSTS_DIR):
        if fn.endswith('.md'):
            posts.append(parse_md(os.path.join(POSTS_DIR, fn)))
    posts.sort(key=lambda p: p['date'], reverse=True)

    # ---- post pages ----
    for i, p in enumerate(posts):
        cat_name = CATEGORIES[p['category']][0]
        # related: same category, exclude self
        related = [q for q in posts if q['category'] == p['category'] and q['slug'] != p['slug']][:3]
        related_html = ''
        if related:
            related_html = '<section class="related"><h2>함께 읽으면 좋은 글</h2><div class="grid">' + \
                ''.join(post_card(q) for q in related) + '</div></section>'
        content = f'''<div class="post-wrapper">
  <nav class="breadcrumb"><a href="/">홈</a> › <a href="/category-{p['category']}.html">{cat_name}</a></nav>
  <article class="post">
    <header class="post-header">
      <h1>{html.escape(p['title'])}</h1>
      <div class="post-meta">
        <span class="author">꿀로그</span> ·
        <time datetime="{p['date']}">{fmt_date(p['date'])}</time> ·
        <span>{p['reading_min']}분 읽기</span>
      </div>
    </header>
    <div class="post-body">
{p['html']}
    </div>
  </article>
</div>
{related_html}'''
        page = layout(f"{p['title']} | {SITE_NAME}", p['description'], content,
                      f"{SITE_URL}/posts/{p['slug']}.html", p['category'])
        open(os.path.join(OUT, 'posts', p['slug'] + '.html'), 'w', encoding='utf-8').write(page)

    # ---- index ----
    latest = posts[:6]
    hero = f'''<section class="hero">
  <h1>생활 속 작은 꿀팁,<br>더 나은 일상을 만듭니다</h1>
  <p>복잡한 정보는 줄이고, 꼭 필요한 핵심만 담았습니다. 직접 경험하고 검증한 생활 노하우를 쉽고 간결하게 전해드립니다.</p>
</section>'''
    cat_sections = ''
    for code, (name, desc) in CATEGORIES.items():
        cposts = [p for p in posts if p['category'] == code][:4]
        cat_sections += f'''<section class="cat-section container">
  <h2 class="section-title">{name}</h2>
  <div class="grid">{''.join(post_card(p) for p in cposts)}</div>
</section>'''
    index_content = hero + f'''<section class="cat-section container">
  <h2 class="section-title">최신 글</h2>
  <div class="grid">{''.join(post_card(p) for p in latest)}</div>
</section>''' + cat_sections
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(
        layout(f'{SITE_NAME} — 생활 속 작은 꿀팁, 더 나은 일상을 만듭니다', SITE_DESC, index_content, SITE_URL + '/'))

    # ---- category pages ----
    for code, (name, desc) in CATEGORIES.items():
        cposts = [p for p in posts if p['category'] == code]
        content = f'''<section class="cat-hero">
  <h1>{name}</h1>
  <p>{desc}</p>
</section>
<div class="container grid">{''.join(post_card(p) for p in cposts)}</div>'''
        open(os.path.join(OUT, f'category-{code}.html'), 'w', encoding='utf-8').write(
            layout(f'{name} | {SITE_NAME}', desc, content, f'{SITE_URL}/category-{code}.html', code))

    # ---- static pages ----
    for fn in os.listdir(PAGES_DIR):
        if fn.endswith('.md'):
            pg = parse_md(os.path.join(PAGES_DIR, fn))
            content = f'''<div class="post-wrapper static-page">
  <article class="post">
    <header class="post-header"><h1>{html.escape(pg['title'])}</h1></header>
    <div class="post-body">{pg['html']}</div>
  </article>
</div>'''
            open(os.path.join(OUT, pg['slug'] + '.html'), 'w', encoding='utf-8').write(
                layout(f"{pg['title']} | {SITE_NAME}", pg['title'] + ' — ' + SITE_NAME, content,
                       f"{SITE_URL}/{pg['slug']}.html"))

    # ---- sitemap.xml ----
    urls = [f'{SITE_URL}/'] + \
           [f'{SITE_URL}/posts/{p["slug"]}.html' for p in posts] + \
           [f'{SITE_URL}/category-{c}.html' for c in CATEGORIES] + \
           [f'{SITE_URL}/{s}.html' for s in ('about', 'contact', 'privacy', 'terms')]
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + \
        ''.join(f'  <url><loc>{u}</loc></url>\n' for u in urls) + '</urlset>\n'
    open(os.path.join(OUT, 'sitemap.xml'), 'w', encoding='utf-8').write(sitemap)

    # ---- robots.txt ----
    open(os.path.join(OUT, 'robots.txt'), 'w', encoding='utf-8').write(
        f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n')

    # ---- ads.txt placeholder ----
    open(os.path.join(OUT, 'ads.txt'), 'w', encoding='utf-8').write(
        'google.com, pub-8241484658511531, DIRECT, f08c47fec0942fa0\n')

    # ---- 404 ----
    content404 = '''<section class="hero">
  <h1>페이지를 찾을 수 없습니다</h1>
  <p>주소가 잘못되었거나 삭제된 페이지입니다. <a href="/">홈으로 돌아가기</a></p>
</section>'''
    open(os.path.join(OUT, '404.html'), 'w', encoding='utf-8').write(
        layout(f'페이지를 찾을 수 없습니다 | {SITE_NAME}', '404', content404, SITE_URL + '/404.html'))

    print(f'빌드 완료: 글 {len(posts)}편, 총 {sum(p["chars"] for p in posts):,}자')

if __name__ == '__main__':
    build()
