#!/usr/bin/env python3
"""썸네일 생성기 (make_thumb.py)

기존 글의 썸네일은 스톡 사진 + '꿀' 워터마크입니다. 스톡 사진을 구하기 어려운
글에는 이 스크립트로 카테고리 색을 쓴 타이포 썸네일을 만들어 같은 규격
(1200x676 JPEG, 우하단 꿀 워터마크)으로 채웁니다.

    python3 make_thumb.py            # thumbnail 이 없는 모든 글에 생성
    python3 make_thumb.py <slug> ..  # 특정 글만 다시 생성
"""
import os, re, sys, math
from PIL import Image, ImageDraw, ImageFont

BASE = os.path.dirname(os.path.abspath(__file__))
POSTS = os.path.join(BASE, 'posts')
IMGDIR = os.path.join(BASE, 'site', 'assets', 'images')
W, H = 1200, 676
FONT = '/System/Library/Fonts/AppleSDGothicNeo.ttc'
WATERMARK = (101, 149, 222)

# 카테고리별 (배경 시작, 배경 끝, 강조색)
PALETTE = {
    'saving':  ((13, 79, 74),   (24, 130, 111), (122, 231, 192)),
    'home':    ((92, 52, 18),   (150, 95, 31),  (253, 205, 128)),
    'food':    ((102, 28, 38),  (163, 56, 53),  (255, 185, 160)),
    'digital': ((26, 38, 96),   (52, 74, 158),  (160, 190, 255)),
}
LABEL = {
    'saving': '절약·재테크', 'home': '살림·청소',
    'food': '요리·식재료', 'digital': '디지털·생활편의',
}


def font(size, index=None):
    for idx in ([index] if index is not None else [2, 1, 0]):
        try:
            return ImageFont.truetype(FONT, size, index=idx)
        except Exception:
            continue
    return ImageFont.load_default()


def wrap(draw, text, fnt, max_w, max_lines):
    """글자 단위 줄바꿈 (한국어는 단어 경계가 길어 어절+글자 혼합으로 자름)."""
    words, lines, cur = text.split(), [], ''
    for w in words:
        trial = (cur + ' ' + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
        while lines[-1] and draw.textlength(lines[-1] + '…', font=fnt) > max_w:
            lines[-1] = lines[-1][:-1]
        lines[-1] += '…'
    return lines


def make(slug, title, category):
    c0, c1, accent = PALETTE.get(category, PALETTE['saving'])
    img = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(img)

    # 대각선 그라데이션
    for y in range(H):
        t = y / (H - 1)
        d.line([(0, y), (W, y)], fill=tuple(round(c0[i] + (c1[i] - c0[i]) * t) for i in range(3)))

    # 은은한 동심원 패턴 (우상단)
    ring = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    for r in range(120, 620, 70):
        rd.ellipse([W - 190 - r, -240 - r, W - 190 + r, -240 + r],
                   outline=accent + (26,), width=3)
    img = Image.alpha_composite(img.convert('RGBA'), ring).convert('RGB')
    d = ImageDraw.Draw(img)

    # 카테고리 라벨
    lf = font(30)
    label = LABEL.get(category, '')
    lw = d.textlength(label, font=lf)
    d.rounded_rectangle([86, 92, 86 + lw + 52, 92 + 58], radius=29, fill=accent)
    d.text((86 + 26, 92 + 29), label, font=lf, fill=c0, anchor='lm')

    # 제목
    tf = font(72)
    lines = wrap(d, title, tf, W - 200, 4)
    y = 206
    for ln in lines:
        d.text((86, y), ln, font=tf, fill=(255, 255, 255))
        y += 92

    # 강조 밑줄
    d.rounded_rectangle([86, min(y + 18, H - 96), 86 + 108, min(y + 26, H - 88)],
                        radius=4, fill=accent)

    # '꿀' 워터마크 (기존 썸네일과 같은 위치·색)
    cx, cy, r = 1130, 600, 45
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WATERMARK)
    d.text((cx, cy + 2), '꿀', font=font(46), fill=(255, 255, 255), anchor='mm')

    os.makedirs(IMGDIR, exist_ok=True)
    out = os.path.join(IMGDIR, slug + '.jpg')
    img.save(out, 'JPEG', quality=86, optimize=True)
    return out


def meta_of(path):
    text = open(path, encoding='utf-8').read()
    m = re.match(r'^---\n(.*?)\n---', text, re.S)
    meta = {}
    if m:
        for line in m.group(1).split('\n'):
            if ':' in line:
                k, v = line.split(':', 1)
                meta[k.strip()] = v.strip().strip('"')
    return meta


if __name__ == '__main__':
    only = set(sys.argv[1:])
    n = 0
    for name in sorted(os.listdir(POSTS)):
        if not name.endswith('.md'):
            continue
        meta = meta_of(os.path.join(POSTS, name))
        slug = meta.get('slug', name[:-3])
        if only and slug not in only:
            continue
        if not only and os.path.exists(os.path.join(IMGDIR, slug + '.jpg')):
            continue  # 이미 사진 썸네일이 있으면 건드리지 않음
        print('->', make(slug, meta.get('title', slug), meta.get('category', 'saving')))
        n += 1
    print(f'{n} thumbnail(s) generated')
