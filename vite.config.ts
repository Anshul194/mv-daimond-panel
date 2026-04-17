import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  server: {
    allowedHosts: ["diamondadmin.nexprism.in"],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor.react';
            }
            if (id.includes('redux') || id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'vendor.redux';
            }
            if (id.includes('apexcharts') || id.includes('chart.js') || id.includes('recharts') || id.includes('chart')) {
              return 'vendor.charts';
            }
            if (id.includes('lodash')) return 'vendor.lodash';
            if (id.includes('axios')) return 'vendor.axios';
            return 'vendor.other';
          }
        },
      },
    },
  },
});
