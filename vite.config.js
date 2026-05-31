import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        login: resolve(root, 'login.html'),
        estoque: resolve(root, 'pages/estoque.html'),
        produtos: resolve(root, 'pages/produtos.html'),
        relatorios: resolve(root, 'pages/relatorios.html')
      }
    }
  }
});
