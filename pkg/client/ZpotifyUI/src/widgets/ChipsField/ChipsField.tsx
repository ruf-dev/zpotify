import { useState } from 'react';

import Chip from '@/components/Chip/Chip';
import cls from '@/widgets/ChipsField/ChipsField.module.css';
import type { AlbumTagKind } from '@/app/api/zpotify';

export type ChipEntry = { kind: AlbumTagKind; value: string };

// Widgets can't import gRPC-generated values (only types) — see the
// `@/app/api/**` restriction in eslint.config.js — so the AlbumTagKind wire
// values are duplicated here as string literals and cast to the type.
const CHIP_KINDS = [
    'ALBUM_TAG_KIND_GENRE',
    'ALBUM_TAG_KIND_MOOD',
    'ALBUM_TAG_KIND_ERA',
    'ALBUM_TAG_KIND_VIBE',
    'ALBUM_TAG_KIND_LANGUAGE',
    'ALBUM_TAG_KIND_THEME',
    'ALBUM_TAG_KIND_HIT',
] as AlbumTagKind[];

const CHIP_KIND_LABELS: Record<string, string> = {
    ALBUM_TAG_KIND_GENRE: 'genre',
    ALBUM_TAG_KIND_MOOD: 'mood',
    ALBUM_TAG_KIND_ERA: 'era',
    ALBUM_TAG_KIND_VIBE: 'vibe',
    ALBUM_TAG_KIND_LANGUAGE: 'language',
    ALBUM_TAG_KIND_THEME: 'theme',
    ALBUM_TAG_KIND_HIT: 'hit',
};

export interface ChipsFieldProps {
    chips: ChipEntry[];
    onChange: (chips: ChipEntry[]) => void;
}

export default function ChipsField({ chips, onChange }: ChipsFieldProps) {
    const [kind, setKind] = useState(CHIP_KINDS[0]);
    const [value, setValue] = useState('');

    function handleKindChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setKind(e.target.value as AlbumTagKind);
    }

    function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
        setValue(e.target.value);
    }

    function handleAdd() {
        const trimmed = value.trim();
        if (!trimmed) return;
        const already = chips.some((c) => c.kind === kind && c.value === trimmed);
        if (already) return;
        onChange([...chips, { kind, value: trimmed }]);
        setValue('');
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    }

    function handleRemove(index: number) {
        onChange(chips.filter((_, i) => i !== index));
    }

    return (
        <div className={cls.ChipsFieldContainer}>
            {chips.length > 0 && (
                <div className={cls.ChipsList}>
                    {chips.map((chip, i) => (
                        <Chip
                            key={`${chip.kind}:${chip.value}`}
                            label={`${CHIP_KIND_LABELS[chip.kind]}: ${chip.value}`}
                            onRemove={function removeChip() {
                                handleRemove(i);
                            }}
                        />
                    ))}
                </div>
            )}
            <div className={cls.AddRow}>
                <select className={cls.KindSelect} value={kind} onChange={handleKindChange}>
                    {CHIP_KINDS.map((k) => (
                        <option key={k} value={k}>
                            {CHIP_KIND_LABELS[k]}
                        </option>
                    ))}
                </select>
                {/* TODO: switch to chures Input once it supports onKeyDown and a placeholder-only (no-label) mode */}
                {/* eslint-disable-next-line no-restricted-syntax -- chures Input has no onKeyDown support, needed for Enter-to-add; it also has no placeholder-only mode */}
                <input
                    className={cls.ValueInput}
                    type="text"
                    value={value}
                    onChange={handleValueChange}
                    onKeyDown={handleKeyDown}
                    placeholder="add tag…"
                />
                <button className={cls.AddButton} type="button" onClick={handleAdd}>
                    +
                </button>
            </div>
        </div>
    );
}
