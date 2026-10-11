import { useEffect, useRef } from 'react';

import { useDialog } from '@/app/hooks/Dialog.tsx';
import useUser from '@/entities/user/useUser.ts';
import { useUISettings } from '@/entities/ui-settings/useUISettings.ts';
import { clipboardPermissionState, parseMagnet, readClipboardText } from '@/features/upload/magnetLink.ts';
import { shouldPromptClipboardMagnet } from '@/features/upload/processes/clipboardMagnetPrompt.ts';

export interface DetectedMagnet {
    magnetUri: string;
    displayName: string;
    infoHash: string;
}

const CHECK_DEBOUNCE_MS = 150;

// Session-only: resets on reload so a still-copied link is offered once per page load.
const seenInfoHashes = new Set<string>();

export function useClipboardMagnetDetector(onDetected: (magnet: DetectedMagnet) => void) {
    const authStatus = useUser((state) => state.authStatus);
    const canUpload = useUser((state) => state.userData?.permissions?.canUpload === true);
    const isEnabled = useUISettings((state) => state.isClipboardMagnetPromptEnabled);
    const onDetectedRef = useRef(onDetected);
    onDetectedRef.current = onDetected;

    const isActive = authStatus === 'authenticated' && canUpload && isEnabled;

    useEffect(() => {
        if (!isActive) return;

        let timer: ReturnType<typeof setTimeout> | undefined;
        let isCancelled = false;

        function check() {
            clipboardPermissionState().then((permissionState) => {
                if (isCancelled || permissionState !== 'granted') return;

                return readClipboardText().then((text) => {
                    if (isCancelled) return;

                    const magnet = text === null ? null : parseMagnet(text);
                    const shouldPrompt = shouldPromptClipboardMagnet({
                        isEnabled,
                        canUpload,
                        permissionState,
                        isDialogOpen: useDialog.getState().children !== null,
                        magnet,
                        seenInfoHashes,
                    });
                    if (!shouldPrompt || text === null || magnet === null) return;

                    seenInfoHashes.add(magnet.infoHash);
                    onDetectedRef.current({ magnetUri: text.trim(), ...magnet });
                });
            });
        }

        function scheduleCheck() {
            clearTimeout(timer);
            timer = setTimeout(check, CHECK_DEBOUNCE_MS);
        }

        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') scheduleCheck();
        }

        scheduleCheck();
        window.addEventListener('focus', scheduleCheck);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
            window.removeEventListener('focus', scheduleCheck);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive, isEnabled, canUpload]);
}
