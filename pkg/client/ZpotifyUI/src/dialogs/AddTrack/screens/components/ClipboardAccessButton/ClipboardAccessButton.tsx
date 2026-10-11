import { useEffect, useState } from 'react';
import { Button } from '@vervstack/chures';

import {
    clipboardPermissionState,
    clipboardSupport,
    isMagnetLink,
    readClipboardMagnet,
    readClipboardText,
    type ClipboardSupport,
} from '@/features/upload/magnetLink.ts';

interface ClipboardAccessButtonProps {
    onMagnet: (magnetUri: string) => void;
}

export default function ClipboardAccessButton({ onMagnet }: ClipboardAccessButtonProps) {
    const [support, setSupport] = useState<ClipboardSupport>('none');
    const [permission, setPermission] = useState<PermissionState | null>(null);

    useEffect(() => {
        let isCancelled = false;
        Promise.all([clipboardSupport(), clipboardPermissionState()]).then(([nextSupport, nextPermission]) => {
            if (isCancelled) return;

            setSupport(nextSupport);
            setPermission(nextPermission);
            if (nextSupport !== 'persistent' || nextPermission !== 'granted') return;

            return readClipboardMagnet().then((magnet) => {
                if (!isCancelled && magnet) onMagnet(magnet);
            });
        });
        return () => {
            isCancelled = true;
        };
    }, []);

    function handleRead() {
        readClipboardText()
            .then((text) => {
                if (text !== null && isMagnetLink(text)) onMagnet(text.trim());
                return clipboardPermissionState();
            })
            .then(setPermission);
    }

    if (support === 'oneShot') {
        return (
            <Button variant="ghost" onClick={handleRead}>
                Paste from clipboard
            </Button>
        );
    }

    if (support === 'persistent' && permission === 'prompt') {
        return (
            <Button variant="ghost" onClick={handleRead}>
                Allow reading clipboard
            </Button>
        );
    }

    return null;
}
