import { useEffect, useRef, useState } from 'react';

import type { ArtistItem } from '@/widgets/ArtistField/ArtistChip';

import cls from '@/widgets/ArtistField/ArtistDropdown.module.css';

interface ArtistDropdownProps {
    excluded: string[];
    loadOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
    onPick: (artist: ArtistItem) => void;
    onClose: () => void;
}

function SearchIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        >
            <circle cx="5" cy="5" r="3.5" />
            <line x1="8" y1="8" x2="11" y2="11" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            width="9"
            height="9"
            viewBox="0 0 9 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
        >
            <line x1="4.5" y1="1" x2="4.5" y2="8" />
            <line x1="1" y1="4.5" x2="8" y2="4.5" />
        </svg>
    );
}

export default function ArtistDropdown({
    excluded,
    loadOptions,
    onCreateArtist,
    onPick,
    onClose,
}: ArtistDropdownProps) {
    const [query, setQuery] = useState('');
    const [options, setOptions] = useState<ArtistItem[]>([]);
    const [creating, setCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        let cancelled = false;
        loadOptions(query).then((results) => {
            if (!cancelled) {
                setOptions(results.filter((a) => !excluded.includes(a.id)).slice(0, 8));
            }
        });
        return () => {
            cancelled = true;
        };
    }, [query]);

    useEffect(() => {
        function handleMousedown(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleMousedown);
        return () => document.removeEventListener('mousedown', handleMousedown);
    }, [onClose]);

    const trimmedQuery = query.trim();
    const exactMatch = options.some((o) => o.name.toLowerCase() === trimmedQuery.toLowerCase());
    const showCreate = trimmedQuery.length > 0 && !exactMatch;

    async function handleCreate() {
        if (!trimmedQuery || creating) return;
        setCreating(true);
        try {
            const artist = await onCreateArtist(trimmedQuery);
            onPick(artist);
        } finally {
            setCreating(false);
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (options.length > 0) {
                onPick(options[0]);
            } else if (showCreate) {
                handleCreate();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    }

    return (
        <div ref={panelRef} className={cls.DropdownContainer}>
            <div className={cls.SearchRow}>
                <div className={cls.SearchBox}>
                    <span className={cls.SearchIcon}>
                        <SearchIcon />
                    </span>
                    <input
                        ref={inputRef}
                        className={cls.SearchInput}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="search or add new…"
                    />
                </div>
            </div>

            <div className={cls.ResultsList}>
                {options.map((artist) => (
                    <div
                        key={artist.id}
                        className={cls.OptionRow}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onPick(artist);
                        }}
                    >
                        {artist.name}
                    </div>
                ))}

                {showCreate && (
                    <div
                        className={`${cls.CreateRow} ${options.length > 0 ? cls.CreateRowWithBorder : ''}`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            handleCreate();
                        }}
                    >
                        <span className={cls.CreateIcon}>
                            <PlusIcon />
                        </span>
                        <span className={cls.CreateLabel}>create &ldquo;{trimmedQuery}&rdquo;</span>
                    </div>
                )}

                {options.length === 0 && !showCreate && <div className={cls.EmptyHint}>no artists found</div>}
            </div>
        </div>
    );
}
