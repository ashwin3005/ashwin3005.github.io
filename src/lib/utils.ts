import type { CollectionEntry } from 'astro:content';

/** Estimate reading time from raw markdown text (~200 wpm) */
export function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

/** Format a Date for display */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Short format for dates in listings */
export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Sort blog posts newest-first, excluding drafts */
export function sortPosts(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts
    .filter(p => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Get all posts in a named series, sorted by seriesPart */
export function getSeriesPosts(
  allPosts: CollectionEntry<'blog'>[],
  seriesName: string,
): CollectionEntry<'blog'>[] {
  return allPosts
    .filter(p => !p.data.draft && p.data.series === seriesName)
    .sort((a, b) => (a.data.seriesPart ?? 0) - (b.data.seriesPart ?? 0));
}

/** Get all unique tags from a set of posts */
export function getAllTags(posts: CollectionEntry<'blog'>[]): string[] {
  return [...new Set(posts.flatMap(p => p.data.tags))].sort();
}

/** ISO date string YYYY-MM-DD for listings */
export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Slugify a string for URL use */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
