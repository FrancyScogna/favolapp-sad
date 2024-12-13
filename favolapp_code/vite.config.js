import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'markdown-loader',
      enforce: 'pre',
      transform(raw, id) {
        if (id.endsWith('.md')) {
          return `export default ${JSON.stringify(raw)}`;
        }
      },
    },
    react(),
  ],
  define: {
    global: {},
  },
});
