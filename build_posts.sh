#!/bin/bash
# build_posts.sh – Convert markdown posts to HTML and copy to public/posts/
# Requires pandoc (standard on macOS) or any markdown-to-html tool.

POSTS_DIR="$(pwd)/posts"
OUTPUT_DIR="$(pwd)/public/posts"

mkdir -p "$OUTPUT_DIR"

# Iterate over markdown files
for md in "$POSTS_DIR"/*.md; do
  [ -e "$md" ] || continue
  filename=$(basename "$md" .md)
  html="$OUTPUT_DIR/${filename}.html"
  # Convert markdown to HTML with basic styling (using the existing styles.css)
  pandoc "$md" -s -c "../styles.css" -o "$html"
  echo "Generated $html"
done
