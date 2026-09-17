import { Button } from '@vervstack/chures';
import cn from 'classnames';

import { RemoveIcon } from '@/assets/icons/RemoveIcon.tsx';
import { useServerStatusBanner } from '@/pages/segments/ServerStatusBanner/useServerStatusBanner.ts';
import cls from '@/pages/segments/ServerStatusBanner/ServerStatusBanner.module.css';

export default function ServerStatusBanner() {
    const { visible, serverVersion, secondsLeft, closing, handleDismiss, handleStopTimer } = useServerStatusBanner();

    if (!visible || !serverVersion) return null;

    const startedAtText = serverVersion.startedAt ? new Date(serverVersion.startedAt).toLocaleString() : 'unknown';

    return (
        <div className={cn(cls.ServerStatusBannerContainer, closing && cls.Closing)}>
            <span className={cls.Message}>
                dev build {serverVersion.version} — server started {startedAtText}
            </span>
            <Button
                type="button"
                variant="ghost"
                className={cls.DismissButton}
                onClick={handleDismiss}
                onMouseEnter={handleStopTimer}
                aria-label="dismiss dev build banner"
            >
                <span className={cls.Countdown}>{secondsLeft}</span>
                <span className={cls.CloseIcon}>
                    <RemoveIcon />
                </span>
            </Button>
        </div>
    );
}
