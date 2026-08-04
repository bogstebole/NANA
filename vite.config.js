import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // bind every interface: on its own Vite only listened on IPv6 [::1], so a
    // browser resolving localhost to 127.0.0.1 got connection refused
    host: true,
    port: 5180,
    // fail loudly instead of silently moving to another port
    strictPort: true,
  },
});
