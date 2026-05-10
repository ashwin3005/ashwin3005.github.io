# AGENTS.md

Guidance for AI agents (Claude Code, etc.) working on this codebase. Read this before making any changes.

## Project Overview

A personal portfolio and blog. Fully static — built with Astro, hosted on GitHub Pages, zero backend. The design goal is minimal, readable, and fast. Every feature decision favours simplicity and static output.

Key constraint: **nothing that requires a server or runtime**. GitHub Pages serves static files only.

## Quick Reference

| Command | What it does |
|---|---|
| `npm run dev` | Start local dev server at `http://localhost:4321` |
| `npm run build` | Build for production (Astro + Pagefind) |
| `npm run preview` | Serve the `dist/` build locally |
| `npm run deploy` | Build and push to the `gh-pages` branch |

Node 22+ required. If `node --version` shows < 22, run `nvm use 22` first.

## Architecture

### How the site builds

1. `astro build` compiles all `.astro` pages and Markdown content into `dist/`
2. `pagefind --site dist --output-path dist/pagefind` crawls the built HTML and writes a static search index into `dist/pagefind/`
3. Both steps must complete — the build script in `package.json` chains them with `&&`

The Pagefind index is not present in the repo — it is regenerated on every build. This means search does not work in `npm run dev`. Use `npm run build && npm run preview` to test search.

### Content Collections

All content lives in `src/content/`. The schemas are defined in `src/content/config.ts` and enforced at build time by TypeScript.

**Blog posts** → `src/content/blog/*.md`
**Projects** → `src/content/projects/*.md`
**Papers** → `src/content/papers/*.md`

The filename becomes the URL slug (no manual slug field needed).

### Routing

| URL pattern | Source file |
|---|---|
| `/` | `src/pages/index.astro` |
| `/blog` | `src/pages/blog/index.astro` |
| `/blog/[slug]` | `src/pages/blog/[...slug].astro` |
| `/blog/tag/[tag]` | `src/pages/blog/tag/[tag].astro` |
| `/papers` | `src/pages/papers/index.astro` |
| `/papers/[slug]` | `src/pages/papers/[...slug].astro` |
| `/papers/tag/[tag]` | `src/pages/papers/tag/[tag].astro` |
| `/projects` | `src/pages/projects/index.astro` |
| `/about` | `src/pages/about.astro` |
| `/contact` | `src/pages/contact.astro` |
| `/404` | `src/pages/404.astro` |

Tag pages are fully static — `getStaticPaths` in `[tag].astro` generates one route per unique tag found across all published posts. No client-side filtering JS.

## Key Files

### `src/lib/config.ts`
The single source of truth for site-wide values: title, URL, author name, social links, default OG image path. Imported throughout layouts and components. **Always update this when personalising the site** — do not hard-code author strings anywhere else.

### `src/lib/utils.ts`
Pure utility functions used across pages:
- `readingTime(body: string)` — estimates read time from raw Markdown text (not rendered HTML)
- `sortPosts(posts)` — filters drafts, sorts newest-first
- `getSeriesPosts(allPosts, seriesName)` — returns all parts of a named series sorted by `seriesPart`
- `getAllTags(posts)` — deduplicates and sorts all tags
- `formatDate(date)` / `formatDateShort(date)` — locale-formatted display dates
- `formatDateISO(date)` — returns `YYYY-MM-DD` string used in post listing rows

### `src/layouts/BaseLayout.astro`
The HTML shell every page renders inside. Handles:
- Inline theme-init script (must stay inline with `is:inline` — removing or deferring it causes FOUC)
- All `<head>` meta: title, description, canonical, OG, Twitter Card, JSON-LD
- Imports `global.css`, renders `Header` and `Footer`
- Accepts props: `title`, `description`, `ogImage?`, `canonicalUrl?`, `schema?`, `ogType?`

### `src/layouts/PostLayout.astro`
Extends `BaseLayout` for blog posts. Adds:
- Post header (title, date, reading time, tags)
- Series navigator (conditional — only when `post.data.series` is set)
- `<article class="prose" data-pagefind-body>` wrapper (the `data-pagefind-body` attribute is what Pagefind indexes — do not remove it)
- JSON-LD `BlogPosting` schema
- Article-specific OG meta (`og:type = article`, `article:published_time`, etc.)
- Post footer with tags and back link

### `src/styles/global.css`
Design tokens as CSS custom properties on `:root`, overridden under `[data-theme="dark"]`. All colours, spacing, typography, radii, and layout widths live here. Do not hard-code values in component `<style>` blocks — always reference a token.

Current design direction: terminal/minimal aesthetic. Key token decisions:
- **Font**: single system monospace stack (`ui-monospace, 'Cascadia Code', 'Fira Code', monospace`) for everything — no Google Fonts, no separate `--font-sans` / `--font-mono` distinction in practice
- **Accent color**: `--color-accent` is forest green (`#16a34a` light / `#4ade80` dark) — used for the `❯` prompt character, active nav links, link hovers, and interactive elements
- **Border radius**: all radius tokens (`--radius-sm/md/lg`) are `2px` — no rounded cards
- **Tags**: the `.tag` class uses a CSS `::before { content: '#' }` — do not add `#` in the HTML text content
- **Section headings**: use `class="sh"` for page-level section labels (uppercase, muted, bottom border) and `class="section-label"` for within-page sections on the about page

### `astro.config.mjs`
Critical settings:
- `site:` must match the actual deployed URL (affects sitemap and canonical URL generation)
- `base:` should be uncommented and set to `/repo-name` for project repos (not user repos)
- `vite.build.rollupOptions.external: ['/pagefind/pagefind-ui.js']` — this externalises the Pagefind import from Vite's bundler. Do not remove it — without it the build fails because Pagefind's JS doesn't exist at build time

## Blog Frontmatter Schema

```yaml
title: string           # required
description: string     # required
pubDate: date           # required (YYYY-MM-DD)
updatedDate: date        # optional
tags: string[]          # optional, default []
series: string          # optional — series name, must match exactly across all parts
seriesPart: number       # optional — 1-indexed position within the series
draft: boolean          # optional, default false — true excludes from ALL output
featured: boolean       # optional, default false — surfaces on home page
ogImage: string         # optional — path relative to /public (e.g. "/images/post-og.png")
```

**`draft: true` posts are completely invisible** — they are filtered out in `getStaticPaths` and `getCollection` calls before any page is built. They do not appear on listings, tag pages, or in the search index.

## Paper Frontmatter Schema

```yaml
title: string           # required — full paper title
authors: string         # optional — e.g. "Vaswani et al."
year: number            # optional — publication year
venue: string           # optional — e.g. "NeurIPS 2023" or "arXiv"
url: string             # optional — link to the actual paper (must be valid URL)
tags: string[]          # optional, default [] — topic tags (e.g. ["transformer", "nlp"])
pubDate: date           # required — date I read it (YYYY-MM-DD)
tldr: string            # optional — one-line summary shown in the listing and as a callout
draft: boolean          # optional, default false
```

The filename becomes the URL slug: `src/content/papers/attention-is-all-you-need.md` → `/papers/attention-is-all-you-need`.

The Markdown body is the full reading notes, rendered as prose on the individual paper page. Tag pages are generated statically at `/papers/tag/[tag]`.

## Project Frontmatter Schema

```yaml
title: string           # required
description: string     # required
tags: string[]          # optional, default []
githubUrl: string       # optional — must be a valid URL
liveUrl: string         # optional — must be a valid URL
featured: boolean       # optional, default false — shown in "Featured" section
order: number           # optional, default 99 — lower = sorted earlier
```

## Design System Conventions

**Use CSS custom properties, not literal values.** All tokens are defined in `src/styles/global.css`. Example:

```css
/* correct */
color: var(--color-text-muted);
padding: var(--space-4);

/* wrong — do not hardcode */
color: #525252;
padding: 1rem;
```

**Component styles are scoped.** Each `.astro` component's `<style>` block is automatically scoped to that component by Astro. Global styles go only in `src/styles/`.

**Dark mode tokens are handled entirely via CSS.** The `[data-theme="dark"]` selector on `<html>` overrides all token values. Components do not need JS or class-toggling — they just use the tokens.

**Exception — `ThemeToggle.astro`** uses `is:inline` JavaScript to set the icon (☾ / ☀) on load and on click. This is intentional: Astro scopes component `<style>` blocks, so using `[data-theme="dark"]` as a parent selector inside a scoped style block is unreliable — the selector gets transformed in a way that breaks ancestor matching. Any component that needs to read the current theme must either use CSS tokens (which work fine) or read `document.documentElement.dataset.theme` in JS. Do not attempt to fix the toggle icon display with CSS `[data-theme] .something` inside a scoped `<style>` — use JS instead.

**Syntax highlighting uses Shiki dual themes.** The CSS variables `--shiki-light`, `--shiki-light-bg`, `--shiki-dark`, `--shiki-dark-bg` are set by Shiki on each `<span>` in a code block. The `global.css` rules that bridge these to the `data-theme` attribute must remain intact:

```css
:root .astro-code span { color: var(--shiki-light); background-color: var(--shiki-light-bg); }
[data-theme="dark"] .astro-code span { color: var(--shiki-dark); background-color: var(--shiki-dark-bg); }
```

## Pagefind Integration Details

Pagefind indexes only elements marked with `data-pagefind-body`. Currently that is the `<article>` element in `PostLayout.astro` — only blog post content is indexed, not pages (Home, About, Contact, etc.).

Elements marked with `data-pagefind-ignore` are excluded from indexing even within an indexed page. `<header>` and `<footer>` carry this attribute.

The hidden `<h1 data-pagefind-meta="title">` inside the article is the title Pagefind displays in search results. Do not remove it.

If you add new content types that should be searchable (e.g. project detail pages), add `data-pagefind-body` to their content wrapper.

## SEO / GEO Layer

Everything is handled in `BaseLayout.astro` and `PostLayout.astro`. When adding a new page:
- Pass a meaningful `title` and `description` to `BaseLayout`
- The canonical URL, OG tags, and Twitter Card are generated automatically from those props and `SITE.url`
- For non-blog pages that represent a person/entity, pass a `schema` prop with the appropriate schema.org JSON-LD object

The `llms.txt` file at `public/llms.txt` describes the site to AI crawlers. Update it when adding major new sections.

## What Is in the Bucketlist (Do Not Implement Without Being Asked)

The following are explicitly deferred and should not be added unless the user requests them:

- **RSS feed** — would use `@astrojs/rss`
- **Comments** — Giscus / GitHub Discussions embed
- **Analytics** — Plausible, Umami, or similar
- **CI/CD** — GitHub Actions deploy workflow
- **Newsletter** — email subscription integration
- **Dynamic OG images** — per-post image generation via Satori

## Common Gotchas

**`.nojekyll` must exist in `public/`.** GitHub Pages runs Jekyll by default. Jekyll ignores directories starting with `_`. Astro puts all JS/CSS bundles in `dist/_astro/`. Without `.nojekyll`, the entire site loads with no styles or scripts. The file is intentionally empty — its presence is the signal.

**Theme init script must use `is:inline`.** The script that reads `localStorage` and sets `document.documentElement.dataset.theme` is in `BaseLayout.astro`. It uses `is:inline` so Astro does not defer or bundle it. If it runs after the first paint, users on dark mode see a flash of the light theme. Do not move it out of `<head>` or remove `is:inline`.

**Pagefind's JS doesn't exist at build time.** The `import('/pagefind/pagefind-ui.js')` in `Search.astro` is externalised from Vite (see `astro.config.mjs`). It only becomes available after `pagefind` runs post-build. The search component catches the import error in dev mode and shows a "build required" message — this is intentional.

**Mobile nav uses a CSS `display:none` guard, not JS injection.** The `[menu]` button in `Header.astro` exists in the HTML at all times but is `display: none` outside `@media (max-width: 560px)`. The mobile drawer (`#mobile-drawer`) starts without the `open` class and is toggled via JS. Do not use JS to inject the button into the DOM — that approach caused the button to render on desktop. Always use CSS media queries to show/hide mobile-only elements.

**`site` in `astro.config.mjs` must be the full URL.** Without it, `@astrojs/sitemap` silently skips sitemap generation and canonical URLs will be wrong. It must include the protocol (`https://`) and match the deployed domain exactly.

**User vs. project GitHub Pages repo.** A user repo (`username.github.io`) serves at the root — no `base` needed. A project repo (`username.github.io/site`) requires `base: '/site'` in `astro.config.mjs`, and the Pagefind import path in `Search.astro` must be prefixed with `import.meta.env.BASE_URL`.

**`readingTime()` takes `post.body`, not rendered HTML.** `post.body` is the raw Markdown string available on a `CollectionEntry` before calling `.render()`. The rendered output from `.render()` is the `Content` Astro component — not a plain string. Always pass `post.body` to `readingTime()`.

## Adding Features — Checklist

When adding anything new:

1. If it needs a server or runtime: **stop — GitHub Pages is static only**. Discuss with the user first.
2. Use `SITE` from `src/lib/config.ts` for any author or URL references — never hardcode.
3. Use CSS tokens from `global.css` — never hardcode colour or spacing values.
4. New pages: pass `title` and `description` to `BaseLayout` — the SEO layer is automatic.
5. New content types: define a schema in `src/content/config.ts` first.
6. After changes: run `npm run build` to verify the full pipeline (TypeScript + Astro + Pagefind) exits cleanly before considering the task done.
