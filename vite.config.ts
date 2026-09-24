import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Two pages: the pitch deck at / and the product overview at /overview.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        overview: fileURLToPath(new URL('./overview/index.html', import.meta.url)),
      },
    },
  },
})
