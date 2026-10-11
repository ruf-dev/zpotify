import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/components/ResolvingTorrentStatus/ResolvingTorrentStatus.module.css';

interface ResolvingTorrentStatusProps {
    torrentName: string;
    onCancel: () => void;
}

export default function ResolvingTorrentStatus({ torrentName, onCancel }: ResolvingTorrentStatusProps) {
    return (
        <div className={cls.ResolvingTorrentStatusContainer}>
            <span className={cls.Title}>Fetching metadata from peers…</span>
            {torrentName && <span className={cls.TorrentName}>{torrentName}</span>}
            <div className={cls.ProgressBar} />
            <div className={cls.ActionsRow}>
                <Button variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
