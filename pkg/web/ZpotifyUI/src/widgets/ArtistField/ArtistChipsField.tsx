import { useState } from 'react';
import cn from 'classnames';

import { ArtistChip, LockedArtistChip } from './ArtistChip';
import ArtistDropdown from './ArtistDropdown';
import type { ArtistItem } from './ArtistChip';

import cls from './ArtistChipsField.module.css';

export type { ArtistItem };

interface ArtistChipsFieldProps {
    artists: ArtistItem[];
    onChange: (artists: ArtistItem[]) => void;
    lockedArtists?: ArtistItem[];
    dense?: boolean;
    placeholder?: string;
    loadOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
    readOnly?: boolean;
}

function PlusIcon({ open }: { open: boolean }) {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
        >
            {open ? (
                <>
                    <line x1="1" y1="1" x2="9" y2="9" />
                    <line x1="9" y1="1" x2="1" y2="9" />
                </>
            ) : (
                <>
                    <line x1="5" y1="1" x2="5" y2="9" />
                    <line x1="1" y1="5" x2="9" y2="5" />
                </>
            )}
        </svg>
    );
}

export default function ArtistChipsField({
    artists,
    onChange,
    lockedArtists = [],
    dense = false,
    placeholder = 'add artist…',
    loadOptions,
    onCreateArtist,
    readOnly,
}: ArtistChipsFieldProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);

    function handleRemove(id: string) {
        onChange(artists.filter((a) => a.id !== id));
    }

    function handlePick(artist: ArtistItem) {
        if (!artists.some((a) => a.id === artist.id) && !lockedArtists.some((a) => a.id === artist.id)) {
            onChange([...artists, artist]);
        }
        setDropdownOpen(false);
    }

    function handleCreate(name: string): Promise<ArtistItem> {
        return onCreateArtist(name).then((artist) => {
            onChange([...artists, artist]);
            return artist;
        });
    }

    function reorder(fromIdx: number, toIdx: number) {
        const next = [...artists];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        onChange(next);
    }

    function chipDragHandlers(idx: number) {
        return {
            draggable: true as const,
            onDragStart(e: React.DragEvent) {
                setDragIdx(idx);
                e.dataTransfer.effectAllowed = 'move';
            },
            onDragOver(e: React.DragEvent) {
                e.preventDefault();
                if (overIdx !== idx) setOverIdx(idx);
            },
            onDrop(e: React.DragEvent) {
                e.preventDefault();
                if (dragIdx != null && dragIdx !== idx) reorder(dragIdx, idx);
                setDragIdx(null);
                setOverIdx(null);
            },
            onDragEnd() {
                setDragIdx(null);
                setOverIdx(null);
            },
        };
    }

    const showPlaceholder = lockedArtists.length === 0 && artists.length === 0;

    return (
        <div className={cn(cls.FieldContainer, dense ? cls.Dense : cls.Default)} role="list">
            {lockedArtists.map((a) => (
                <span key={a.id} role="listitem">
                    <LockedArtistChip artist={a} />
                </span>
            ))}

            {artists.map((a, idx) => (
                <span key={a.id} role="listitem">
                    {readOnly ? (
                        <LockedArtistChip artist={a} />
                    ) : (
                        <ArtistChip
                            artist={a}
                            onRemove={handleRemove}
                            isDragging={dragIdx === idx}
                            isDragOver={overIdx === idx}
                            dragHandlers={chipDragHandlers(idx)}
                        />
                    )}
                </span>
            ))}

            {showPlaceholder && <span className={cls.Placeholder}>{placeholder}</span>}

            {!readOnly && (
                <div className={cls.AddButtonWrapper}>
                    <button
                        type="button"
                        className={`${cls.AddButton} ${dropdownOpen ? cls.AddButtonOpen : ''}`}
                        onClick={() => setDropdownOpen((o) => !o)}
                        aria-label="add artist"
                    >
                        <PlusIcon open={dropdownOpen} />
                    </button>

                    {dropdownOpen && (
                        <ArtistDropdown
                            excluded={[...lockedArtists.map((a) => a.id), ...artists.map((a) => a.id)]}
                            loadOptions={loadOptions}
                            onCreateArtist={handleCreate}
                            onPick={handlePick}
                            onClose={() => setDropdownOpen(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
