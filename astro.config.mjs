import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ashwin3005.github.io',
  // base: '/repo-name',  // Uncomment if this is a project repo, not a user repo
  integrations: [sitemap()],
  output: 'static',
  vite: {
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind-ui.js'],
      },
    },
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
  },
});
