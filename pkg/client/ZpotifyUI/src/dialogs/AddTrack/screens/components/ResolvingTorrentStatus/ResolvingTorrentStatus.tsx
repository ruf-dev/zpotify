import { useEffect, useState } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/components/ResolvingTorrentStatus/ResolvingTorrentStatus.module.css';
import MagnetIcon from '@/assets/icons/MagnetIcon.tsx';
import { resolvingStatusText } from '@/dialogs/AddTrack/screens/processes/resolvingStatusText.ts';

interface ResolvingTorrentStatusProps {
    torrentName: string;
    onCancel: () => void;
}

export default function ResolvingTorrentStatus({ torrentName, onCancel }: ResolvingTorrentStatusProps) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        const startedAt = Date.now();
        const intervalId = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const statusText = resolvingStatusText(elapsedSeconds);

    return (
        <div className={cls.ResolvingTorrentStatusContainer}>
            <div className={cls.PulseWrapper}>
                <MagnetIcon width={40} height={40} className={cls.Icon} />
            </div>
            <span className={cls.Title}>Fetching metadata from peers…</span>
            {torrentName && <span className={cls.TorrentName}>{torrentName}</span>}
            <span key={statusText} className={cls.StatusText}>
                {statusText}
            </span>
            <div className={cls.ActionsRow}>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
