import { Button } from '@vervstack/chures';

import cls from '@/widgets/CachedSongsAccordion/components/CachedSongRow/CachedSongRow.module.css';
import { RemoveTrackIcon } from '@/assets/icons/RemoveTrackIcon.tsx';

interface CachedSongRowProps {
    title: string;
    artist: string;
    onRemove: () => void;
}

export default function CachedSongRow({ title, artist, onRemove }: CachedSongRowProps) {
    return (
        <li className={cls.CachedSongRowContainer}>
            <div className={cls.SongInfoWrapper}>
                <span className={cls.SongTitle}>{title}</span>
                <span className={cls.SongArtist}>{artist}</span>
            </div>
            <Button variant="iconDanger" aria-label={`Remove ${title} from cache`} onClick={onRemove}>
                <RemoveTrackIcon />
            </Button>
        </li>
    );
}
