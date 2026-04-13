# Personal Portfolio Site — Implementation Plan

## Architecture Decisions (Upfront)

**CSS approach: Plain CSS with custom properties (no Tailwind)**
A small, hand-authored CSS file with CSS custom properties for color tokens and typography scales. More transparent, more maintainable, and produces a smaller bundle.

**Astro content collections**
Astro's Content Collections API provides schema validation on frontmatter, type-safe queries, and co-locates all content metadata.

**GitHub Pages deployment mode: static output with base path awareness**
Treats the case of a custom domain / user-level Pages repo (root path). If it is a project repo (`username.github.io/site`), set `base: '/site'` in config.

**Pagefind integration**
Pagefind runs as a post-build CLI step: `pagefind --site dist`. Invoked from `package.json` build script, not as an Astro integration.

**Node version:** Node 20 LTS (Astro v5 requires Node 18.17.1+)

---

## Phase 1 — Project Scaffolding & Configuration

### 1.1 Initialize the Astro project

```bash
npm create astro@latest . -- --template minimal --typescript strict --git false --install
npm install --save-dev @astrojs/sitemap
npm install --save-dev pagefind
```

### 1.2 Files created by scaffolding

```
/home/ashwin/Documents/site/
  astro.config.mjs
  package.json
  tsconfig.json
  src/
    pages/
      index.astro
    env.d.ts
  public/
  .gitignore
```

### 1.3 `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://username.github.io',  // CHANGE to actual URL
  // base: '/repo-name',              // UNCOMMENT if project repo (not user repo)
  integrations: [sitemap()],
  output: 'static',
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark:  'github-dark',
      },
      wrap: true,
    },
  },
});
```

> **Gotcha — GitHub Pages base path**: If this is `username.github.io` (user/org Pages), `base` is omitted. If it is a project repo, set `base: '/site'` — every manually constructed URL must prepend `import.meta.env.BASE_URL`.

> **Gotcha — `output: 'static'`**: Being explicit prevents accidentally enabling SSR later. GitHub Pages cannot run server-side code.

### 1.4 `package.json` — build script

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && npx pagefind --site dist --output-path dist/pagefind",
    "preview": "astro preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

> **Gotcha**: Pagefind does not run in `dev` mode — search won't work locally. Use `npm run build && npm run preview` to test search.

### 1.5 Folder structure

```
src/
  components/
  layouts/
  pages/
    blog/
    projects/
  content/
    blog/          # .md files for posts
    projects/      # .md files for projects
  styles/
  scripts/
  lib/
public/
  images/
  robots.txt
  llms.txt
  .nojekyll       # CRITICAL — prevents Jekyll processing on GitHub Pages
```

### 1.6 Content collections schema — `src/content/config.ts`

```ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),
    seriesPart: z.number().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    githubUrl: z.string().url().optional(),
    liveUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

export const collections = { blog, projects };
```

### 1.7 `tsconfig.json` — path aliases

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*":    ["src/layouts/*"],
      "@lib/*":        ["src/lib/*"],
      "@styles/*":     ["src/styles/*"],
      "@content/*":    ["src/content/*"]
    }
  }
}
```

---

## Phase 2 — Layout & Design System

### 2.1 Color tokens and typography — `src/styles/global.css`

```css
:root {
  --color-bg:         #ffffff;
  --color-bg-subtle:  #f5f5f5;
  --color-surface:    #ebebeb;
  --color-border:     #d4d4d4;
  --color-text:       #171717;
  --color-text-muted: #525252;
  --color-accent:     #2563eb;
  --color-accent-hover: #1d4ed8;

  --font-sans:  'Inter', system-ui, sans-serif;
  --font-mono:  'Roboto Mono', 'Fira Code', monospace;

  --text-xs:  0.75rem;  --text-sm: 0.875rem; --text-base: 1rem;
  --text-lg:  1.125rem; --text-xl: 1.25rem;  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem; --text-4xl: 2.25rem;

  --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem;
  --space-4: 1rem;    --space-6: 1.5rem;  --space-8: 2rem;
  --space-12: 3rem;   --space-16: 4rem;

  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  --max-width-prose: 68ch;
  --max-width-wide:  1100px;
  --transition: 150ms ease;
}

[data-theme="dark"] {
  --color-bg:         #0a0a0a;
  --color-bg-subtle:  #171717;
  --color-surface:    #262626;
  --color-border:     #404040;
  --color-text:       #fafafa;
  --color-text-muted: #a3a3a3;
  --color-accent:     #60a5fa;
  --color-accent-hover: #93c5fd;
}
```

Shiki dual-theme CSS (also in `global.css`):

```css
:root .astro-code,
:root .astro-code span {
  color: var(--shiki-light);
  background-color: var(--shiki-light-bg);
}
[data-theme="dark"] .astro-code,
[data-theme="dark"] .astro-code span {
  color: var(--shiki-dark);
  background-color: var(--shiki-dark-bg);
}
```

### 2.2 Base layout — `src/layouts/BaseLayout.astro`

Props: `title`, `description`, `ogImage?`, `canonicalUrl?`, `schema?`

Structure:
```
<html lang="en" data-theme="light">
  <head>
    <!-- inline theme-init script (MUST be before paint) -->
    <!-- meta charset, viewport -->
    <!-- SEO/OG meta tags -->
    <!-- font preloads -->
    <!-- global.css -->
    <slot name="head" />
  </head>
  <body>
    <Header />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

### 2.3 Theme toggle — inline script (FOUC prevention)

```html
<script is:inline>
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved ?? (prefersDark ? 'dark' : 'light');
</script>
```

> **Gotcha — `is:inline`**: Must use this directive. Without it, Astro defers the script, causing FOUC.

### 2.4 `src/components/Header.astro`

- Site title linking to `/`
- Nav: Blog, Projects, About, Contact
- `ThemeToggle` on the right
- Mobile: collapses via `<details>/<summary>` pattern (no JS)
- `position: sticky; top: 0;` with subtle backdrop blur

### 2.5 `src/components/Footer.astro`

- Copyright line
- Social links (GitHub, LinkedIn, Twitter/X)

### 2.6 Site config — `src/lib/config.ts`

```ts
export const SITE = {
  title: 'Your Name',
  description: 'Personal blog and portfolio.',
  url: 'https://username.github.io',
  author: {
    name: 'Your Name',
    email: 'you@example.com',
    twitter: '@yourhandle',
    github: 'https://github.com/username',
    linkedin: 'https://linkedin.com/in/username',
  },
  defaultOgImage: '/images/og-default.png',
} as const;
```

### 2.7 `src/layouts/PostLayout.astro`

Extends `BaseLayout`. Adds:
- Article header: title, date, tags, reading time, series badge
- `<article class="prose">` wrapping `<slot />`
- `SeriesNav` component (if post is in a series)
- Post footer: tag list

### 2.8 `src/styles/prose.css`

Targets `.prose` class. Styles headings, paragraphs, lists, blockquotes, code blocks, tables, images. Constrains line-length to `var(--max-width-prose)`. ~150 lines of custom CSS.

---

## Phase 3 — Blog System

### 3.1 Utilities — `src/lib/utils.ts`

```ts
export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function sortPosts(posts: CollectionEntry<'blog'>[]) {
  return posts
    .filter(p => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getSeriesPosts(allPosts: CollectionEntry<'blog'>[], seriesName: string) {
  return sortPosts(allPosts)
    .filter(p => p.data.series === seriesName)
    .sort((a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0));
}

export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  return [...new Set(posts.flatMap(p => p.data.tags))].sort();
}
```

> Reading time uses `entry.body` (raw Markdown text), not the rendered HTML.

### 3.2 Syntax highlighting

Dual Shiki themes configured in `astro.config.mjs` (Phase 1). CSS variables bridge the light/dark toggle with code block colors (see Phase 2.1).

### 3.3 Blog post routing — `src/pages/blog/[...slug].astro`

Uses catch-all `[...slug]` so slugs can contain slashes. `getStaticPaths` maps every non-draft post to a route. Fetches series context if `post.data.series` is set.

### 3.4 Tag routing — `src/pages/blog/tag/[tag].astro`

`getStaticPaths` generates one route per unique tag. URL pattern: `/blog/tag/typescript`.

### 3.5 Sample post frontmatter

```md
---
title: "Getting Started with Rust: Ownership"
description: "A beginner's guide to Rust's ownership model."
pubDate: 2026-03-01
tags: ["rust", "systems-programming", "beginner"]
series: "Getting Started with Rust"
seriesPart: 1
featured: false
draft: false
---
```

### 3.6 `src/components/SeriesNav.astro`

Props: `seriesPosts`, `currentSlug`. Renders a numbered list of all parts in the series with the current post highlighted. Placed above the prose content in `PostLayout`.

---

## Phase 4 — Pages

### 4.1 `src/pages/index.astro` (Home)

1. **Hero**: Name, tagline, brief bio (2-3 sentences). Compact, not full-page.
2. **Recent/Featured Posts**: Newest 3 or `featured: true`. Uses `PostCard`.
3. **Quick Projects**: Featured projects, 2-column card grid. Link to `/projects`.
4. CTA links to `/about` and `/contact`.

### 4.2 `src/components/PostCard.astro`

Props: `title`, `description`, `pubDate`, `tags`, `slug`, `readingTime`
Renders: card with title link, date, reading time, tag pills.

### 4.3 `src/pages/blog/index.astro` (Blog listing)

- All published posts, newest-first
- Tag filter links (static routes to `/blog/tag/[tag]`)
- Pagefind search input (mounted in Phase 5)
- `PostCard` for each post

### 4.4 `src/pages/projects/index.astro`

- `getCollection('projects')`, sorted by `order`
- Groups: "Featured" and "Other" based on `featured: true`
- Project card: title, description, tags, GitHub/live links

### 4.5 `src/pages/about.astro`

Static page using `BaseLayout` directly. Sections: Bio, Skills grid, Background timeline.

### 4.6 `src/pages/contact.astro`

Static links only (email `mailto:`, GitHub, LinkedIn, Twitter). No server-side form. Formspree can be added later if a form is needed.

### 4.7 `src/pages/404.astro`

GitHub Pages automatically serves `dist/404.html` for unknown routes.

---

## Phase 5 — Blog Interactivity

### 5.1 Tag filtering

Already implemented via static routes in Phase 3.4. No JavaScript needed. Tag links are `<a href="/blog/tag/{tag}">`.

### 5.2 Pagefind search

**Mark indexable content** in `PostLayout.astro`:

```html
<article class="prose" data-pagefind-body>
<h1 data-pagefind-meta="title">...</h1>
```

Exclude chrome from index:

```html
<header data-pagefind-ignore>
<footer data-pagefind-ignore>
```

**`src/components/Search.astro`** — mounts Pagefind UI:

```js
async function initSearch() {
  const { PagefindUI } = await import('/pagefind/pagefind-ui.js');
  new PagefindUI({
    element: '#search',
    showImages: false,
    resetStyles: true,
    excerptLength: 25,
  });
}
initSearch().catch(() => {
  document.getElementById('search').innerHTML =
    '<p>Search available after build.</p>';
});
```

> **Gotcha — Pagefind in dev mode**: `pagefind-ui.js` doesn't exist until after `npm run build`. The catch block handles this gracefully.

> **Gotcha — base path**: If `base` is set, the import path becomes `/repo-name/pagefind/pagefind-ui.js`. Use `import.meta.env.BASE_URL` to construct it dynamically.

**`src/styles/pagefind.css`** — override Pagefind defaults with site design tokens.

---

## Phase 6 — SEO / GEO Layer

### 6.1 Meta tags in `BaseLayout.astro`

```astro
<title>{title} | {SITE.title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />

<meta property="og:type" content="website" />
<meta property="og:url" content={canonical} />
<meta property="og:title" content={`${title} | ${SITE.title}`} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImg} />
<meta property="og:site_name" content={SITE.title} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content={SITE.author.twitter} />
<meta name="twitter:title" content={`${title} | ${SITE.title}`} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImg} />
```

### 6.2 Blog post meta overrides in `PostLayout.astro`

```html
<meta property="og:type" content="article" />
<meta property="article:published_time" content={pubDate.toISOString()} />
<meta property="article:author" content={SITE.author.name} />
```

### 6.3 `src/components/JsonLd.astro`

```astro
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

**Blog post schema** (in `PostLayout.astro`):

```ts
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.data.title,
  "description": post.data.description,
  "datePublished": post.data.pubDate.toISOString(),
  "dateModified": (post.data.updatedDate ?? post.data.pubDate).toISOString(),
  "author": { "@type": "Person", "name": SITE.author.name, "url": SITE.url },
  "url": canonical,
  "keywords": post.data.tags.join(', '),
}
```

**Person schema** (on About page):

```ts
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": SITE.author.name,
  "url": SITE.url,
  "sameAs": [SITE.author.github, SITE.author.linkedin],
}
```

### 6.4 Sitemap

Auto-generated by `@astrojs/sitemap`. Requires `site` to be set in `astro.config.mjs`.

### 6.5 `public/robots.txt`

```
User-agent: *
Allow: /

Sitemap: https://username.github.io/sitemap-index.xml
```

### 6.6 `public/llms.txt`

```
# Your Name — Personal Blog & Portfolio

> A personal blog covering [topics].

## Blog
- [Blog Index](https://username.github.io/blog)

## About
- [About](https://username.github.io/about)

## Projects
- [Projects](https://username.github.io/projects)

## Contact
- [Contact](https://username.github.io/contact)
```

### 6.7 Canonical URL

Derived in `BaseLayout.astro`:

```ts
const canonical = canonicalUrl ?? new URL(Astro.url.pathname, SITE.url).href;
```

---

## Phase 7 — Final Polish & Testing

### 7.1 Image optimization

Use Astro's built-in `<Image>` from `astro:assets` for all local images. OG images are pre-generated static PNGs in `public/images/`.

### 7.2 Font strategy

**Recommended**: System fonts only — zero latency, no layout shift.
- Body: `system-ui, sans-serif`
- Code: `ui-monospace, monospace`

Upgrade path: self-host Inter + Roboto Mono in `public/fonts/` with `font-display: swap`.

### 7.3 Accessibility checklist

- [ ] All images have `alt` text
- [ ] Color contrast meets WCAG AA (4.5:1) in both light and dark modes
- [ ] Keyboard navigation works throughout (Tab order, focus styles)
- [ ] `aria-label` on icon-only buttons (theme toggle, hamburger)
- [ ] `role="search"` on search container
- [ ] `<nav aria-label="Main navigation">` in Header
- [ ] Skip-to-main-content link at top of `<body>` (visually hidden, visible on focus)

### 7.4 Performance checklist

- [ ] No JS in `<head>` except inline theme-init script
- [ ] Pagefind loaded via async dynamic `import()`
- [ ] No unused CSS
- [ ] No third-party scripts on page load
- [ ] Target Lighthouse: 95+ Performance, 100 Accessibility, 100 Best Practices, 100 SEO

### 7.5 Minimum viable content for launch

```
src/content/blog/
  hello-world.md
  sample-series-part-1.md

src/content/projects/
  project-1.md
```

### 7.6 GitHub Pages deployment

```bash
npm install --save-dev gh-pages
# then: npm run deploy
```

Pushes `dist/` to `gh-pages` branch. Configure GitHub Pages in repo Settings to serve from `gh-pages` branch.

> **Gotcha — `.nojekyll`**: CRITICAL. Without `public/.nojekyll`, GitHub Pages runs Jekyll and the `_astro/` directory (JS/CSS bundles) is silently ignored — the site loads with no styles or scripts.

### 7.7 Pre-launch checklist

- [ ] `SITE.url` in `src/lib/config.ts` matches actual deployed URL
- [ ] `site` in `astro.config.mjs` matches actual deployed URL
- [ ] `robots.txt` sitemap URL is correct
- [ ] `llms.txt` URLs are correct
- [ ] `.nojekyll` exists in `public/`
- [ ] All pages have unique `<title>` and `<description>`
- [ ] OG image exists at `SITE.defaultOgImage` path
- [ ] Search works: `npm run build && npm run preview`
- [ ] Dark mode persists on page refresh
- [ ] Tag links resolve correctly
- [ ] Series navigation works (prev/next links)
- [ ] `npm run build` exits 0 with no TypeScript errors
- [ ] Sitemap accessible at `/sitemap-index.xml`
- [ ] JSON-LD validated via Google Rich Results Test

---

## Complete File Map

```
Phase 1 — Scaffolding
  astro.config.mjs
  package.json
  tsconfig.json
  src/content/config.ts
  src/env.d.ts
  public/.nojekyll
  public/robots.txt
  public/llms.txt
  public/images/og-default.png

Phase 2 — Design System
  src/styles/global.css
  src/styles/prose.css
  src/lib/config.ts
  src/layouts/BaseLayout.astro
  src/layouts/PostLayout.astro
  src/components/Header.astro
  src/components/Footer.astro
  src/components/ThemeToggle.astro

Phase 3 — Blog System
  src/lib/utils.ts
  src/pages/blog/[...slug].astro
  src/pages/blog/tag/[tag].astro
  src/components/SeriesNav.astro
  src/content/blog/hello-world.md
  src/content/blog/sample-series-part-1.md

Phase 4 — Pages
  src/pages/index.astro
  src/pages/blog/index.astro
  src/pages/projects/index.astro
  src/pages/about.astro
  src/pages/contact.astro
  src/pages/404.astro
  src/components/PostCard.astro
  src/components/ProjectCard.astro
  src/content/projects/project-1.md

Phase 5 — Interactivity
  src/components/Search.astro
  src/styles/pagefind.css

Phase 6 — SEO/GEO
  src/components/JsonLd.astro
  (BaseLayout.astro updated)
  (PostLayout.astro updated)

Phase 7 — Polish
  src/components/OptimizedImage.astro  (optional)
  public/fonts/                        (optional)
```

---

## Dependency Summary

| Package | Type | Purpose |
|---|---|---|
| `astro` | dep | Framework |
| `@astrojs/sitemap` | dev | Sitemap generation |
| `pagefind` | dev | Search index CLI (post-build) |
| `gh-pages` | dev | Manual deploy to GitHub Pages |

No other external dependencies. Shiki is bundled with Astro.

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| CSS | Plain CSS + custom properties | Control, minimal complexity, no build tooling |
| Fonts | System fonts | Zero latency, no layout shift |
| Tag filtering | Static routes (`/blog/tag/[tag]`) | SEO-friendly, no JS |
| Search | Pagefind post-build CLI | Only correct approach for static GitHub Pages |
| Theme storage | `localStorage` + `data-theme` on `<html>` | No FOUC, no framework dependency |
| Series grouping | Frontmatter fields on posts | No extra collection needed |
| OG images | Static PNGs in `public/` | Simple; dynamic gen is a future upgrade |
| Forms | Links only (or Formspree) | GitHub Pages cannot process forms server-side |
| `.nojekyll` | In `public/` | Critical — without it `_astro/` assets 404 |
