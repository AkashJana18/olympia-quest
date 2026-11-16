import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Project pages live at https://<user>.github.io/olympia-quest/
// Change this if you rename the repository.
export default defineConfig({
  base: '/olympia-quest/',
  plugins: [react()],
  build: {
    target: 'es2020',
  },
})
