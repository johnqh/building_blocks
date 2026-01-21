import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        firebase: resolve(__dirname, 'src/firebase.ts'),
      },
      name: 'BuildingBlocks',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@heroicons/react/24/outline',
        '@heroicons/react/24/solid',
        '@sudobility/components',
        '@sudobility/design',
        '@sudobility/auth-components',
        '@sudobility/auth_lib',
        '@sudobility/di',
        '@sudobility/di_web',
        '@sudobility/entity_client',
        '@sudobility/web3-components',
        '@sudobility/devops-components',
        '@sudobility/subscription-components',
        '@sudobility/subscription_lib',
        '@sudobility/types',
        '@tanstack/react-query',
        'class-variance-authority',
        'clsx',
        'i18next',
        'react-helmet-async',
        'react-i18next',
        'react-router-dom',
        'tailwind-merge',
        'firebase',
        'firebase/auth',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
    minify: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
