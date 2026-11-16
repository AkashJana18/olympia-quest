import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Vercel and the custom domain serve from the root.
// GitHub Pages builds set VITE_BASE=/olympia-quest/ in the workflow.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: {
    target: 'es2020',
  },
})
