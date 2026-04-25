import {useEffect, useRef, useState} from 'react';
import cls from '@/dialogs/AddTrack/ArtistMultiSelect.module.css';

interface ArtistMultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export default function ArtistMultiSelect({options, selected, onChange}: ArtistMultiSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleDown = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleDown);
        return () => document.removeEventListener('mousedown', handleDown);
    }, []);

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
                    {options.length === 0 ? (
                        <div className={cls.EmptyOption}>no artists available</div>
                    ) : (
                        options.map(artist => {
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
                        })
                    )}
                </div>
            )}
        </div>
    );
}