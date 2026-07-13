import { useState } from 'react';
import { Button, ChevronDownIcon } from '@vervstack/chures';
import cn from 'classnames';

import cls from '@/widgets/CachedSongsAccordion/components/AlbumGroupRow/AlbumGroupRow.module.css';
import CachedSongRow from '@/widgets/CachedSongsAccordion/components/CachedSongRow/CachedSongRow.tsx';
import { RemoveTrackIcon } from '@/assets/icons/RemoveTrackIcon.tsx';
import type { CachedSongEntry } from '@/shared/model/audioCacheStore.ts';

interface AlbumGroupRowProps {
    label: string;
    songs: CachedSongEntry[];
    onRemoveSong: (url: string) => void;
    onDeleteGroup: () => void;
}

export default function AlbumGroupRow({ label, songs, onRemoveSong, onDeleteGroup }: AlbumGroupRowProps) {
    const [expanded, setExpanded] = useState(false);

    function handleToggle() {
        setExpanded((prev) => !prev);
    }

    function handleDeleteClick(e: React.MouseEvent) {
        e.stopPropagation();
        onDeleteGroup();
    }

    return (
        <li className={cls.AlbumGroupContainer}>
            <div className={cls.AlbumGroupHeaderRow}>
                <Button
                    variant="ghost"
                    className={cls.AlbumGroupToggle}
                    onClick={handleToggle}
                    aria-expanded={expanded}
                >
                    <span className={cn(cls.Chevron, expanded && cls.ChevronOpen)}>
                        <ChevronDownIcon size={12} />
                    </span>
                    <span className={cls.AlbumLabel}>{label}</span>
                    <span className={cls.AlbumCount}>{songs.length}</span>
                </Button>

                <Button variant="iconDanger" aria-label={`Remove ${label} from cache`} onClick={handleDeleteClick}>
                    <RemoveTrackIcon />
                </Button>
            </div>

            <div className={cn(cls.AlbumGroupBody, expanded && cls.AlbumGroupBodyOpen)}>
                <div className={cls.AlbumGroupBodyInner}>
                    <ul className={cls.AlbumSongList}>
                        {songs.map((song) => (
                            <CachedSongRow
                                key={song.url}
                                title={song.title}
                                artist={song.artist}
                                onRemove={() => onRemoveSong(song.url)}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </li>
    );
}
