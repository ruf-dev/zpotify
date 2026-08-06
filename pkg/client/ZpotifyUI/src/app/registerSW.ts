import { registerSW } from 'virtual:pwa-register';
import { useToaster as useChuresToaster } from '@vervstack/chures';

export function initServiceWorker() {
    registerSW({
        immediate: true,
        onOfflineReady() {
            useChuresToaster.getState().bake({
                title: 'Ready for offline use',
                description: 'Zpotify will keep working without an internet connection.',
                level: 'Info',
                isDismissable: true,
            });
        },
        onRegisterError(error) {
            console.error('Service worker registration failed', error);
        },
    });
}
