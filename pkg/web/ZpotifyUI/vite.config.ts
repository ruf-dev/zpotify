import {fileURLToPath, URL} from 'node:url'

import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

export default ({mode}: { mode: string }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};

  return defineConfig({
    base: '/',
    plugins: [react()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  });
}
