import { useState } from 'react';
import cn from 'classnames';

import cls from '@/widgets/CachedSongsAccordion/CachedSongsAccordion.module.css';
import AccordionHeader from '@/widgets/CachedSongsAccordion/components/AccordionHeader/AccordionHeader.tsx';
import CachedSongRow from '@/widgets/CachedSongsAccordion/components/CachedSongRow/CachedSongRow.tsx';
import { useAudioCacheStore, useCachedSongs } from '@/shared/model/audioCacheStore.ts';

export default function CachedSongsAccordion() {
    const [expanded, setExpanded] = useState(false);
    const cachedSongs = useCachedSongs();

    function handleToggle() {
        setExpanded((prev) => !prev);
    }

    function handleRemove(url: string) {
        useAudioCacheStore.getState().removeCachedUrl(url);
    }

    return (
        <div className={cls.CachedSongsAccordionContainer}>
            <AccordionHeader
                label="Cached Songs"
                count={cachedSongs.length}
                expanded={expanded}
                onToggle={handleToggle}
            />

            <div className={cn(cls.AccordionBody, expanded && cls.AccordionBodyOpen)}>
                <div className={cls.AccordionBodyInner}>
                    {cachedSongs.length === 0 ? (
                        <p className={cls.EmptyState}>No cached songs yet</p>
                    ) : (
                        <ul className={cls.SongList}>
                            {cachedSongs.map((song) => (
                                <CachedSongRow
                                    key={song.url}
                                    title={song.title}
                                    artist={song.artist}
                                    onRemove={() => handleRemove(song.url)}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
