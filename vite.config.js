import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Recharts + D3 — only used on analytics/admin pages, no React.forwardRef at module init
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
            return 'charts';
          }
          // QR code — self-contained, no React dependency at module root
          if (id.includes('node_modules/qrcode') && !id.includes('react-qrcode')) {
            return 'qr';
          }
          // PDF generation — heavy, rarely used, no React.forwardRef at root
          if (id.includes('node_modules/jspdf') || id.includes('node_modules/html2canvas')) {
            return 'pdf';
          }
          // DnD kit — used only in specific pages, safe to isolate
          if (id.includes('node_modules/@dnd-kit')) {
            return 'dnd';
          }
          // Everything else (React, ReactDOM, Radix, framer-motion, router, etc.)
          // stays in a single vendor chunk so React is always initialized before consumers
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
        // Optimize chunk naming and caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimization settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
      format: {
        comments: false, // Remove comments
      },
    },
    cssMinify: true,
    // Additional build optimizations
    cssCodeSplit: true, // Enable CSS code splitting
    sourcemap: false, // Disable sourcemaps in production
    // Configure chunk size warnings
    chunkSizeWarningLimit: 1000, // Size in kBs
    // Optimize asset loading
    assetsInlineLimit: 4096, // 4kb - files smaller than this will be inlined
    // Enable module preload polyfill
    modulePreload: {
      polyfill: true,
    },
    // Improve build performance
    target: 'es2015',
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Development server configuration
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    open: true,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
  // Enable faster builds
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  }
});