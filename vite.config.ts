import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';
import VueRouter from 'unplugin-vue-router/vite';
import ViteSvgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    VueRouter(),
    Vue(),
    ViteSvgLoader({
      defaultImport: 'url',
      svgoConfig: {
        plugins: [
          'removeXMLNS',
          {
            name: 'removeAttrs',
            params: {
              attrs: 'fill',
            },
          },
          {
            name: 'addAttributesToSVGElement',
            params: {
              attribute: {
                'aria-hidden': 'true',
                fill: 'currentColor',
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "~/assets/scss/variables.scss" as *;',
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/main.[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
  },
});
