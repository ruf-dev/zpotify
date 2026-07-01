import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import type { SongBase } from '@/app/api/zpotify';
import { songsService } from '@/shared/api/Songs.ts';
import { SearchIcon } from '@/assets/icons/SearchIcon';
import { formatDuration } from '@/shared/lib/time';

import cls from '@/dialogs/MultitrackUpload/SongSearchBox/SongSearchBox.module.css';

interface SongSearchBoxProps {
    excludedIds: Set<string>;
    onAddSong: (song: SongBase) => void;
}

const DEBOUNCE_MS = 250;

export default function SongSearchBox({ excludedIds, onAddSong }: SongSearchBoxProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SongBase[]>([]);
    const [loading, setLoading] = useState(false);
    const reqIdRef = useRef(0);

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length === 0) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const reqId = ++reqIdRef.current;
        const handle = setTimeout(function runSearch() {
            songsService
                .SearchSongs(trimmed)
                .then((songs) => {
                    if (reqIdRef.current === reqId) setResults(songs);
                })
                .catch(() => {
                    if (reqIdRef.current === reqId) setResults([]);
                })
                .finally(() => {
                    if (reqIdRef.current === reqId) setLoading(false);
                });
        }, DEBOUNCE_MS);

        return () => clearTimeout(handle);
    }, [query]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setQuery(e.target.value);
    }

    function handlePick(song: SongBase) {
        onAddSong(song);
    }

    const visible = results.filter((s) => s.id && !excludedIds.has(s.id));
    const showPanel = query.trim().length > 0;

    return (
        <div className={cls.SongSearchBoxContainer}>
            <div className={cls.SearchBox}>
                <span className={cls.SearchIcon}>
                    <SearchIcon />
                </span>
                <input
                    className={cls.SearchInput}
                    value={query}
                    onChange={handleChange}
                    placeholder="search existing songs by title or artist…"
                />
            </div>

            {showPanel && (
                <div className={cls.ResultsPanel}>
                    {loading ? (
                        <div className={cls.HintRow}>searching…</div>
                    ) : visible.length === 0 ? (
                        <div className={cls.HintRow}>no songs found</div>
                    ) : (
                        visible.map(function renderRow(song) {
                            const artists = (song.artists ?? [])
                                .map((a) => a.name)
                                .filter(Boolean)
                                .join(', ');
                            const duration =
                                song.durationSec && song.durationSec > 0
                                    ? formatDuration(Math.round(song.durationSec))
                                    : '—';
                            return (
                                <button
                                    key={song.id}
                                    type="button"
                                    className={cls.ResultRow}
                                    onClick={() => handlePick(song)}
                                >
                                    <span className={cls.ResultText}>
                                        <span className={cls.ResultTitle}>{song.title || 'untitled'}</span>
                                        {artists && <span className={cls.ResultArtists}>{artists}</span>}
                                    </span>
                                    <span className={cls.ResultDuration}>{duration}</span>
                                    <span className={cn(cls.AddIcon)}>+</span>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
