# Personal Portfolio & Blog

A fast, minimal personal site and blog built with [Astro](https://astro.build), hosted on GitHub Pages. Entirely static — no backend, no database, no runtime.

## Features

- **Markdown-driven blog** — write posts as `.md` files with YAML frontmatter
- **Blog series** — group multi-part posts together with a series navigator
- **Reading time** — estimated per post, derived from word count
- **Tag system** — every post can have tags; each tag has its own browsable page
- **Client-side search** — full-text search via [Pagefind](https://pagefind.app), built at deploy time, zero backend
- **Dark / light mode** — system preference aware, togglable, persisted in localStorage, no flash of unstyled content
- **Syntax highlighting** — dual light/dark themes via Shiki, built into Astro
- **SEO / GEO ready** — Open Graph, Twitter Card, JSON-LD schema.org, canonical URLs, sitemap, robots.txt, llms.txt
- **Zero JS by default** — only the theme-init inline script and Pagefind are client-side; everything else is static HTML

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Astro v5 (static output) |
| Language | TypeScript (strict) |
| Content | Markdown with typed frontmatter (Astro Content Collections) |
| Styling | Plain CSS with custom properties |
| Syntax highlighting | Shiki (bundled with Astro) |
| Search | Pagefind (post-build CLI) |
| Sitemap | `@astrojs/sitemap` |
| Hosting | GitHub Pages |
| Deploy | `gh-pages` npm package |

## Project Structure

```
src/
  components/
    Header.astro          # Sticky nav with dark/light toggle, mobile hamburger
    Footer.astro          # Copyright, social links
    ThemeToggle.astro     # Theme toggle button
    PostCard.astro        # Blog post preview card
    ProjectCard.astro     # Project card for the projects grid
    SeriesNav.astro       # In-post series navigator (prev/next in series)
    Search.astro          # Pagefind search UI mount
    JsonLd.astro          # Generic JSON-LD structured data emitter
  layouts/
    BaseLayout.astro      # HTML shell: meta tags, OG, dark mode init, header/footer
    PostLayout.astro      # Extends BaseLayout: post header, prose, series nav, JSON-LD
  pages/
    index.astro           # Home — hero, recent posts, featured projects
    about.astro           # About — bio, skills, background
    contact.astro         # Contact — social/email links
    404.astro             # Custom 404 page
    blog/
      index.astro         # Blog listing — search sidebar, tag list, all posts
      [...slug].astro     # Individual post route (dynamic)
      tag/[tag].astro     # Posts filtered by tag (static routes, one per tag)
    projects/
      index.astro         # Projects listing — featured and other
  content/
    config.ts             # Content collection schemas (blog + projects)
    blog/                 # .md files — one file = one blog post
    projects/             # .md files — one file = one project
  lib/
    config.ts             # Site-wide config: title, URL, author, social links
    utils.ts              # Shared utilities: readingTime, sortPosts, getAllTags, etc.
  styles/
    global.css            # CSS custom properties (design tokens), reset, base styles
    prose.css             # Styles for Markdown-rendered article content
    pagefind.css          # Pagefind UI overrides to match the design system
public/
  .nojekyll               # Prevents GitHub Pages from running Jekyll (critical)
  robots.txt              # Allow all + sitemap URL
  llms.txt                # GEO: site description for AI crawlers
  favicon.svg             # SVG favicon
  images/                 # Static images (OG default, etc.)
```

## Getting Started

**Requirements:** Node.js 22+ (uses `nvm` — run `nvm use 22` if needed)

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:4321)
npm run dev

# Build for production (Astro + Pagefind)
npm run build

# Preview the production build locally
npm run preview
```

> Search does not work in `dev` mode — Pagefind only runs during `build`. Use `npm run build && npm run preview` to test search locally.

## Writing a Blog Post

Create a `.md` file in `src/content/blog/`. The filename becomes the URL slug.

```
src/content/blog/my-post-title.md  →  /blog/my-post-title
```

### Frontmatter reference

```yaml
---
title: "Post Title"                          # required — page title and OG title
description: "One-sentence summary."         # required — meta description and card text
pubDate: 2026-04-14                          # required — publication date (YYYY-MM-DD)
updatedDate: 2026-05-01                      # optional — shows "Updated" date if set
tags: ["rust", "beginner"]                   # optional — array of tag strings
series: "Understanding Rust Ownership"       # optional — series name (must match exactly across parts)
seriesPart: 1                                # optional — part number within the series (1, 2, 3…)
featured: false                              # optional — surfaces on home page if true
draft: false                                 # optional — true = excluded from build entirely
ogImage: "/images/my-post-og.png"            # optional — custom OG image path (relative to /public)
---

Post content in Markdown here.
```

**Rules:**
- `draft: true` posts are completely excluded from the build — they won't appear anywhere
- Tags must be plain lowercase strings (e.g. `"rust"`, `"web-dev"`) — they become URL path segments
- For a series, every part must have the same `series` string and a unique `seriesPart` number
- Syntax highlighting is automatic for fenced code blocks — just add the language identifier (` ```rust `, ` ```ts `, etc.)

### Example

````markdown
---
title: "Getting Started with Rust: Ownership"
description: "A practical intro to Rust's ownership model."
pubDate: 2026-04-10
tags: ["rust", "systems-programming"]
series: "Getting Started with Rust"
seriesPart: 1
---

## Introduction

Rust's ownership system is what makes Rust unique...

```rust
fn main() {
    let s = String::from("hello");
    println!("{}", s);
}
```
````

## Adding a Project

Create a `.md` file in `src/content/projects/`:

```yaml
---
title: "Project Name"                        # required
description: "What this project does."       # required
tags: ["rust", "cli"]                        # optional
githubUrl: "https://github.com/you/repo"     # optional
liveUrl: "https://yourproject.com"           # optional
featured: false                              # optional — appears in "Featured" section if true
order: 1                                     # optional — manual sort order (lower = first)
---

Optional longer description in Markdown. Currently not rendered but reserved for future detail pages.
```

## Customising the Site

All site-level settings live in `src/lib/config.ts`:

```ts
export const SITE = {
  title: 'Your Name',
  description: 'One-sentence site description.',
  url: 'https://yourusername.github.io',       // must match astro.config.mjs `site`
  author: {
    name: 'Your Name',
    email: 'you@example.com',
    twitter: '@yourhandle',                    // used for Twitter Card meta
    github: 'https://github.com/yourusername',
    linkedin: 'https://linkedin.com/in/you',
  },
  defaultOgImage: '/images/og-default.png',    // fallback OG image for all pages
};
```

Also update `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://yourusername.github.io',
  // base: '/repo-name',  // uncomment for project repos (not user repos)
  ...
});
```

And update `public/robots.txt` and `public/llms.txt` with your actual URL.

## Design System

All visual values are CSS custom properties defined in `src/styles/global.css`. The full token set:

| Token | Purpose |
|---|---|
| `--color-bg`, `--color-bg-subtle`, `--color-surface` | Background layers |
| `--color-border` | Borders and dividers |
| `--color-text`, `--color-text-muted` | Foreground text |
| `--color-accent`, `--color-accent-hover` | Interactive elements |
| `--font-sans`, `--font-mono` | Typography |
| `--text-xs` … `--text-4xl` | Type scale |
| `--space-1` … `--space-16` | Spacing scale |
| `--radius-sm`, `--radius-md`, `--radius-lg` | Border radii |
| `--max-width-prose`, `--max-width-wide` | Layout widths |
| `--transition` | Motion timing |

Dark mode overrides live under the `[data-theme="dark"]` selector. The theme is toggled via `document.documentElement.dataset.theme` and persisted in `localStorage`.

## Build & Deploy

### Build

```bash
npm run build
```

This runs `astro build` followed by `pagefind --site dist --output-path dist/pagefind`. Both must succeed for a complete build.

### Deploy to GitHub Pages

```bash
npm run deploy
```

This builds the site and pushes the `dist/` directory to the `gh-pages` branch using the `gh-pages` package.

**GitHub repo setup:**
1. Go to repo Settings → Pages
2. Set source to: **Deploy from a branch**
3. Branch: `gh-pages`, folder: `/ (root)`
4. Save

**For a project repo** (e.g. `username.github.io/site`):
- Uncomment `base: '/site'` in `astro.config.mjs`
- Update `site:` to `https://username.github.io`
- Update `robots.txt` and `llms.txt` URLs accordingly

### Important: `.nojekyll`

The file `public/.nojekyll` must exist. Without it, GitHub Pages runs Jekyll on the pushed files and silently ignores the `_astro/` directory (where all JS and CSS bundles live), breaking the site completely.

## SEO / GEO Checklist

Every page automatically gets:
- `<title>` and `<meta name="description">`
- `<link rel="canonical">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type`)
- Twitter Card tags
- `lang="en"` on `<html>`

Every blog post additionally gets:
- `og:type = article` with `article:published_time`, `article:author`, `article:tag`
- JSON-LD `BlogPosting` structured data
- Reading time and tag metadata

Site-wide:
- `sitemap-index.xml` + `sitemap-0.xml` (all pages, generated by `@astrojs/sitemap`)
- `robots.txt` pointing to the sitemap
- `llms.txt` for AI crawler discoverability (GEO)

## Bucketlist

Features planned but not yet implemented:

- **RSS feed** — `@astrojs/rss` generates a valid RSS/Atom feed at `/rss.xml`
- **Comments** — Giscus (GitHub Discussions-backed), fully static embed
- **Analytics** — Plausible or Umami (self-hosted), privacy-first
- **CI/CD** — GitHub Actions workflow: push to `master` → build → deploy to `gh-pages`
- **Newsletter** — email subscription (e.g. Buttondown or Resend)
- **Dynamic OG images** — per-post OG images generated at build time via Satori
