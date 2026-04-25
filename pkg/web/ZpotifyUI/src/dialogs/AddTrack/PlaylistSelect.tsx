import {useEffect, useRef, useState} from 'react';
import cls from '@/dialogs/AddTrack/PlaylistSelect.module.css';

export interface PlaylistOption {
    id: string;
    name: string;
}

interface PlaylistSelectProps {
    options: PlaylistOption[];
    value: string;
    onChange: (id: string) => void;
    onCreatePlaylist: (name: string) => void;
}

export default function PlaylistSelect({options, value, onChange, onCreatePlaylist}: PlaylistSelectProps) {
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

    const selected = options.find(o => o.id === value);
    const filtered = query
        ? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
        : options;

    const trimmed = query.trim();
    const canCreate = trimmed.length > 0 && !options.some(o => o.name.toLowerCase() === trimmed.toLowerCase());

    const handleSelect = (id: string) => {
        onChange(id === value ? '' : id);
        setOpen(false);
    };

    const handleCreate = () => {
        onCreatePlaylist(trimmed);
        setQuery('');
        setOpen(false);
    };

    return (
        <div ref={containerRef} className={cls.PlaylistSelectContainer}>
            <div
                className={`${cls.Trigger} ${open ? cls.TriggerOpen : ''} ${value ? cls.TriggerFilled : ''}`}
                onClick={() => setOpen(o => !o)}
            >
                <span className={selected ? cls.TriggerValue : cls.Placeholder}>
                    {selected ? selected.name : 'pick a playlist…'}
                </span>
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
                        <div className={cls.EmptyOption}>no playlists — type to create one</div>
                    )}
                    {filtered.map(playlist => (
                        <div
                            key={playlist.id}
                            className={`${cls.Option} ${playlist.id === value ? cls.OptionSelected : ''}`}
                            onClick={() => handleSelect(playlist.id)}
                        >
                            <div className={`${cls.RadioDot} ${playlist.id === value ? cls.RadioDotSelected : ''}`}/>
                            <span className={`${cls.OptionLabel} ${playlist.id === value ? cls.OptionLabelSelected : ''}`}>
                                {playlist.name}
                            </span>
                        </div>
                    ))}
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