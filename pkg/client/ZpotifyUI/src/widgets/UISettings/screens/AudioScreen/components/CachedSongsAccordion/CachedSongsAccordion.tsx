import { useState } from 'react';
import cn from 'classnames';

import cls from '@/widgets/UISettings/screens/AudioScreen/components/CachedSongsAccordion/CachedSongsAccordion.module.css';
import ChevronRightIcon from '@/assets/icons/ChevronRightIcon.tsx';
import { RemoveTrackIcon } from '@/assets/icons/RemoveTrackIcon.tsx';
import { useAudioCacheStore, useCachedSongs } from '@/shared/model/audioCacheStore.ts';

export default function CachedSongsAccordion() {
    const [expanded, setExpanded] = useState(false);
    const cachedSongs = useCachedSongs();

    function handleToggle() {
        setExpanded((prev) => {
            const next = !prev;
            if (next) {
                useAudioCacheStore.getState().refreshCachedSongsMeta();
            }
            return next;
        });
    }

    return (
        <div className={cls.AccordionContainer}>
            <button type="button" className={cls.AccordionHeader} onClick={handleToggle} aria-expanded={expanded}>
                <span className={cls.HeaderLabel}>Cached Songs</span>
                <span className={cls.HeaderCount}>{cachedSongs.length}</span>
                <span className={cn(cls.Chevron, expanded && cls.ChevronOpen)}>
                    <ChevronRightIcon />
                </span>
            </button>

            <div className={cn(cls.AccordionBody, expanded && cls.AccordionBodyOpen)}>
                <div className={cls.AccordionBodyInner}>
                    {cachedSongs.length === 0 ? (
                        <p className={cls.EmptyState}>No cached songs yet</p>
                    ) : (
                        <ul className={cls.SongList}>
                            {cachedSongs.map((song) => (
                                <li key={song.url} className={cls.SongRow}>
                                    <div className={cls.SongInfo}>
                                        <span className={cls.SongTitle}>{song.title}</span>
                                        <span className={cls.SongArtist}>{song.artist}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={cls.RemoveButton}
                                        aria-label={`Remove ${song.title} from cache`}
                                        onClick={() => useAudioCacheStore.getState().removeCachedUrl(song.url)}
                                    >
                                        <RemoveTrackIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
