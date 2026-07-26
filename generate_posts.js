// generate_posts.js
// Simple script that creates a markdown file with a placeholder post.
// No external dependencies – uses Node's built‑in `fs` and `path` modules.

const fs = require('fs');
const path = require('path');

// Determine date strings
const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const isoDate = `${yyyy}-${mm}-${dd}`;

// File name like 2026-07-27-auto-post.md
const fileName = `${isoDate}-auto-post.md`;
const postsDir = path.join(__dirname, 'posts');
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
}
const filePath = path.join(postsDir, fileName);

// Simple template – you can edit later.
const content = `# 자동 포스트 – ${isoDate}

이 포스트는 자동화 워크플로에 의해 매주 생성됩니다. 아래는 간단한 React \`useEffect\` 예시와 Next.js 정적 페이지 코드를 포함합니다.

---

## React \`useEffect\` 예시

\`\`\`js
import { useState, useEffect } from 'react';
function Example() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('https://api.example.com/data')
      .then(r => r.json())
      .then(setData);
  }, []);
  return <div>{data ? JSON.stringify(data) : 'Loading...'}</div>;
}
\`\`\`

## Next.js 정적 페이지 예시

\`\`\`js
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();
  return { props: { posts } };
}
\`\`\`
`;

fs.writeFileSync(filePath, content, { encoding: 'utf8' });
console.log(`Created post: ${filePath}`);
