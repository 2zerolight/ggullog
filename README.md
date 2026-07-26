# 꿀로그 (ggullog.com)

생활을 바꾸는 진짜 꿀팁 — 절약·살림·요리·디지털 생활 정보 블로그.

## 구조

| 경로 | 설명 |
| --- | --- |
| `site/` | 빌드된 정적 사이트 (배포 대상) |
| `posts/` | 블로그 글 원본 (Markdown) |
| `pages/` | 소개·연락처·개인정보처리방침·이용약관 원본 |
| `build.py` | Markdown → HTML 빌드 스크립트 |
| `wrangler.toml` | Cloudflare Workers 배포 설정 |
| `배포가이드.md` | 배포 및 애드센스 신청 안내 |

## 빌드 및 배포

```bash
pip3 install markdown
python3 build.py
npx wrangler deploy
```

자세한 내용은 [배포가이드.md](./배포가이드.md)를 참고하세요.
