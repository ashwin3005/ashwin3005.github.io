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

const papers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.string().optional(),
    year: z.number().optional(),
    venue: z.string().optional(),
    url: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    pubDate: z.coerce.date(),        // date I read it
    tldr: z.string().optional(),     // one-line summary
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, projects, papers };
