import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The website is one HTML page per section of the site (home at /, then
// /platform, /method, /company and /news, our form at /interest, /contact, the legal pages at /impressum
// and /privacy); the investor deck is at /deck/. 404.html is what the server sends for a missing address.
const pages = ['platform', 'method', 'company', 'news', 'interest', 'contact', 'impressum', 'privacy', 'deck']

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        site: resolve(import.meta.dirname, 'index.html'),
        notfound: resolve(import.meta.dirname, '404.html'),
        ...Object.fromEntries(pages.map((p) => [p, resolve(import.meta.dirname, `${p}/index.html`)])),
      },
    },
  },
})
