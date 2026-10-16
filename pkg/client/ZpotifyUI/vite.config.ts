import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import type { Plugin } from 'vite';

// The production bundle (make serve-rc) registers a precaching service worker at /sw.js on this
// origin. In desktop mode the dev server has no such file and answers /sw.js with index.html, so
// the browser can never update that worker and keeps serving the stale precached bundle instead of
// the dev server. Answering with a self-removing worker clears it.
const SERVICE_WORKER_KILL_SWITCH = `
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
            .then(() => self.registration.unregister())
            .then(() => self.clients.matchAll({ type: 'window' }))
            .then((clients) => clients.forEach((client) => client.navigate(client.url))),
    );
});
`;

function devServiceWorkerKillSwitch(): Plugin {
    return {
        name: 'dev-service-worker-kill-switch',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use('/sw.js', (_req, res) => {
                res.setHeader('Content-Type', 'application/javascript');
                res.setHeader('Cache-Control', 'no-store');
                res.end(SERVICE_WORKER_KILL_SWITCH);
            });
        },
    };
}

export default ({ mode }: { mode: string }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

    const uc = defineConfig({
        base: '/',
        plugins: [
            react(),
            devServiceWorkerKillSwitch(),
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
        port: 15173,
        strictPort: true,
        proxy: {
            '/api': 'http://localhost:8087',
            '/wapi': 'http://localhost:8087',
        },
        allowedHosts: ['.loca.lt', '.zpotify.ru', 'localhost', '127.0.0.1', ''],
    };

    return uc;
};
