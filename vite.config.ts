import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The website is one HTML page per section of the site (home at /, then
// /platform, /method, /company and /news, and our form at /interest); the investor deck is at /deck/.
const pages = ['platform', 'method', 'company', 'news', 'interest', 'deck']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        site: resolve(import.meta.dirname, 'index.html'),
        ...Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}/index.html`)])),
      },
    },
  },
})
