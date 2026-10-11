import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/components/TorrentSearchError/TorrentSearchError.module.css';

interface TorrentSearchErrorProps {
    message: string;
    onRetry: () => void;
}

export default function TorrentSearchError({ message, onRetry }: TorrentSearchErrorProps) {
    return (
        <div className={cls.TorrentSearchErrorContainer}>
            <span className={cls.Message}>{message}</span>
            <Button variant="secondary" onClick={onRetry}>
                Retry
            </Button>
        </div>
    );
}
