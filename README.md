# ashwin3005.github.io

Personal site and blog — built with [Astro](https://astro.build), statically rendered, and hosted on GitHub Pages. No backend, no runtime; just fast static HTML/CSS.

The design is intentionally minimal and readable: a clean sans-serif default with an optional monospace mode, light/dark themes, and prominent social links.

## Tech stack

- **[Astro](https://astro.build)** — static site generation + content collections
- **[Pagefind](https://pagefind.app)** — static, build-time search index (no server)
- **[@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)** — automatic `sitemap.xml`
- Plain CSS with design tokens (custom properties) — no CSS framework
- Deployed via [`gh-pages`](https://www.npmjs.com/package/gh-pages)

Node 22+ is required (see `.nvmrc`). If `node --version` is older, run `nvm use`.

## Getting started

```bash
npm install
npm run dev        # local dev server at http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server (live reload; search is disabled here) |
| `npm run build` | Build the site to `dist/` and generate the Pagefind search index |
| `npm run preview` | Serve the built `dist/` locally (use this to test search) |
| `npm run deploy` | Build and publish `dist/` to the `gh-pages` branch |

> **Note:** `npm run preview` serves the last `npm run build` output, not your source.
> After editing or deleting content, rebuild before previewing.

## Project structure

```
src/
├── components/      Reusable UI (Header, Footer, cards, toggles, social links)
├── content/         Markdown content collections
│   ├── blog/        Blog posts        → /blog/<slug>
│   ├── papers/      Paper notes       → /papers/<slug>
│   ├── projects/    Project entries   → /projects
│   └── config.ts    Collection schemas (frontmatter validation)
├── layouts/         BaseLayout (the HTML shell) + PostLayout (article view)
├── lib/
│   ├── config.ts    Site-wide config: title, URL, author, social links
│   └── utils.ts     Date formatting, sorting, tag helpers, reading time
├── pages/           File-based routes
└── styles/          global.css (design tokens), prose.css, pagefind.css
public/              Static assets served as-is (favicon, robots.txt, llms.txt)
```

## Adding content

Drop a Markdown file into the relevant collection — the filename becomes the URL slug. Frontmatter is validated against the schema in `src/content/config.ts`.

A blog post (`src/content/blog/my-post.md`):

```yaml
---
title: "My Post Title"        # required
description: "Short summary"  # required
pubDate: 2026-06-21           # required (YYYY-MM-DD)
tags: ["astro", "web"]        # optional
featured: true                # optional — surfaces on the home page
draft: false                  # optional — true hides it everywhere
---

Post body in Markdown…
```

Set `draft: true` to keep a post out of all listings, tag pages, and search until it's ready.

## Personalizing

Edit `src/lib/config.ts` — it's the single source of truth for the title, URL, author name, and social links (GitHub, X, LinkedIn, email). These flow into the header, footer, social icons, and SEO metadata automatically.

## Deployment

```bash
npm run deploy
```

This runs the build and pushes `dist/` (including dotfiles like `.nojekyll`) to the `gh-pages` branch, which GitHub Pages serves.

---

See [`AGENTS.md`](./AGENTS.md) for detailed architecture notes and conventions.
