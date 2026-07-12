import {useState} from 'react';
import {Input} from '@vervstack/chures';
import cn from 'classnames';

import {SearchIcon} from '@/assets/icons/SearchIcon';
import cls from '@/widgets/CachedSongsAccordion/CachedSongsAccordion.module.css';
import AccordionHeader from '@/widgets/CachedSongsAccordion/components/AccordionHeader/AccordionHeader.tsx';
import CachedSongRow from '@/widgets/CachedSongsAccordion/components/CachedSongRow/CachedSongRow.tsx';
import {type CachedSongEntry, useAudioCacheStore, useCachedSongs} from '@/shared/model/audioCacheStore.ts';

function matchesQuery(song: CachedSongEntry, query: string): boolean {
    if (!query) return true;

    return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        (song.playlistName?.toLowerCase().includes(query) ?? false)
    );
}

export default function CachedSongsAccordion() {
    const [expanded, setExpanded] = useState(false);
    const [query, setQuery] = useState('');
    const cachedSongs = useCachedSongs();

    const normalizedQuery = query.trim().toLowerCase();
    const filteredSongs = cachedSongs.filter((song) => matchesQuery(song, normalizedQuery));

    function handleToggle() {
        setExpanded((prev) => {
            const next = !prev;
            if (next) {
                useAudioCacheStore.getState().refreshCachedSongsMeta();
            }
            return next;
        });
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
                        <>
                            <Input
                                value={query}
                                setValue={setQuery}
                                startIcon={<SearchIcon/>}
                                placeholder="Search by title, author or playlist…"
                                className={cls.SearchInputWrapper}
                            />

                            <div className={cls.SongListScroll}>
                                {filteredSongs.length === 0 ? (
                                    <p className={cls.EmptyState}>No songs match your search</p>
                                ) : (
                                    <ul className={cls.SongList}>
                                        {filteredSongs.map((song) => (
                                            <CachedSongRow
                                                key={song.url}
                                                title={song.title}
                                                artist={song.artist}
                                                playlistName={song.playlistName}
                                                onRemove={() => handleRemove(song.url)}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
