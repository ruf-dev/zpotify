import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default ({ mode }: { mode: string }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const uc = defineConfig({
        base: '/',
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['logo.svg'],
                manifest: {
                    name: 'Zpotify',
                    short_name: 'Zpotify',
                    theme_color: '#0a0a0a',
                    background_color: '#0a0a0a',
                    display: 'standalone',
                    start_url: '/',
                },
                pwaAssets: {
                    preset: 'minimal-2023',
                    image: 'public/logo.svg',
                },
                workbox: {
                    globPatterns: ['**/*.{js,css,html,svg,woff2}'],
                    cleanupOutdatedCaches: true,
                    navigateFallback: 'index.html',
                    skipWaiting: true,
                    clientsClaim: true,
                },
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
    });

    uc.server = {
        host: true, // allows access from network IPs
        port: 5173,
        strictPort: true,
        allowedHosts: ['.loca.lt', 'localhost', '127.0.0.1', ''],
    };

    return uc;
};
