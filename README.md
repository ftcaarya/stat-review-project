# The Quiet Harvest — ScreenTalk Forum

Mock movie review forum for a fictional film, built as a plain static site (no build step, no dependencies).

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` directly via `file://` won't work — `reviews.json` is loaded with `fetch`, which requires a server.)

## Deploy

- **GitHub Pages**: push this repo, then enable Pages in Settings → Pages → Deploy from branch (root).
- **Vercel**: `vercel` in this directory, or import the repo on vercel.com — no config needed, it's static.

## Files

- `index.html` / `style.css` / `script.js` — the site
- `reviews.json` — the mock review data (14 seed reviews, avg ~7.1/10); edit this to change the dataset
