import {useEffect, useRef, useState} from 'react';
import cls from '@/dialogs/AddTrack/ArtistMultiSelect.module.css';

interface ArtistMultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    onCreateArtist: (name: string) => void;
}

export default function ArtistMultiSelect({options, selected, onChange, onCreateArtist}: ArtistMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleDown = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleDown);
        return () => document.removeEventListener('mousedown', handleDown);
    }, []);

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setQuery('');
        }
    }, [open]);

    const toggle = (artist: string) => {
        onChange(
            selected.includes(artist)
                ? selected.filter(a => a !== artist)
                : [...selected, artist]
        );
    };

    const remove = (e: React.MouseEvent, artist: string) => {
        e.stopPropagation();
        onChange(selected.filter(a => a !== artist));
    };

    const filtered = query
        ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
        : options;

    const trimmed = query.trim();
    const canCreate = trimmed.length > 0 && !options.some(o => o.toLowerCase() === trimmed.toLowerCase());

    const handleCreate = () => {
        onCreateArtist(trimmed);
        onChange([...selected, trimmed]);
        setQuery('');
    };

    return (
        <div ref={containerRef} className={cls.ArtistMultiSelectContainer}>
            <div
                className={`${cls.Trigger} ${open ? cls.TriggerOpen : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                {selected.length === 0 ? (
                    <span className={cls.Placeholder}>pick artist(s)…</span>
                ) : (
                    selected.map(artist => (
                        <span key={artist} className={cls.Pill}>
                            {artist}
                            <button
                                className={cls.PillRemove}
                                type="button"
                                onClick={e => remove(e, artist)}
                            >×</button>
                        </span>
                    ))
                )}
                <svg
                    className={`${cls.Chevron} ${open ? cls.ChevronOpen : ''}`}
                    width="12" height="12" viewBox="0 0 12 12"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                >
                    <path d="M2 4l4 4 4-4"/>
                </svg>
            </div>

            {open && (
                <div className={cls.Dropdown}>
                    <div className={cls.SearchRow}>
                        <input
                            ref={inputRef}
                            className={cls.SearchInput}
                            placeholder="search or type to create…"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                    {filtered.length === 0 && !canCreate && (
                        <div className={cls.EmptyOption}>no artists found</div>
                    )}
                    {filtered.map(artist => {
                        const checked = selected.includes(artist);
                        return (
                            <div
                                key={artist}
                                className={`${cls.Option} ${checked ? cls.OptionChecked : ''}`}
                                onClick={() => toggle(artist)}
                            >
                                <div className={`${cls.Checkbox} ${checked ? cls.CheckboxChecked : ''}`}>
                                    {checked && (
                                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path className={cls.CheckPath} d="M1.5 4.5L3.5 6.5L7.5 2.5"/>
                                        </svg>
                                    )}
                                </div>
                                <span className={`${cls.OptionLabel} ${checked ? cls.OptionLabelChecked : ''}`}>
                                    {artist}
                                </span>
                            </div>
                        );
                    })}
                    {canCreate && (
                        <div className={cls.CreateOption} onClick={handleCreate}>
                            <span className={cls.CreateLabel}>create "{trimmed}"</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}