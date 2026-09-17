import { useEffect, useState } from 'react';

import { fetchServerVersion, ServerVersion } from '@/shared/api/VersionService.ts';

const AUTO_CLOSE_SECONDS = 15;
const CLOSE_ANIMATION_MS = 300;

export function useServerStatusBanner() {
    const [serverVersion, setServerVersion] = useState<ServerVersion | undefined>();
    const [dismissed, setDismissed] = useState(false);
    const [closing, setClosing] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(AUTO_CLOSE_SECONDS);
    const [timerStopped, setTimerStopped] = useState(false);

    useEffect(() => {
        fetchServerVersion()
            .then(setServerVersion)
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (timerStopped || dismissed || closing) return;

        const timeoutId = setTimeout(() => {
            if (secondsLeft <= 1) {
                setClosing(true);
            } else {
                setSecondsLeft((prev) => prev - 1);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [secondsLeft, timerStopped, dismissed, closing]);

    useEffect(() => {
        if (!closing) return;

        const timeoutId = setTimeout(() => setDismissed(true), CLOSE_ANIMATION_MS);

        return () => clearTimeout(timeoutId);
    }, [closing]);

    function handleDismiss() {
        setClosing(true);
    }

    function handleStopTimer() {
        setTimerStopped(true);
    }

    const visible = !dismissed && serverVersion?.devMode === true;

    return { visible, serverVersion, secondsLeft, closing, handleDismiss, handleStopTimer };
}
