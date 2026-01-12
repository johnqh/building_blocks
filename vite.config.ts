import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BuildingBlocks',
      formats: ['es'],
      fileName: 'index',
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
        '@sudobility/web3-components',
        '@sudobility/devops-components',
        '@sudobility/subscription-components',
        '@sudobility/types',
        'class-variance-authority',
        'clsx',
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
