import { useState } from 'react';
import { Button, Dropdown, Input } from '@vervstack/chures';
import type { DropdownOption } from '@vervstack/chures';

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

const KIND_OPTIONS: DropdownOption[] = CHIP_KINDS.map((k) => ({ id: k, name: CHIP_KIND_LABELS[k] }));

export interface ChipsFieldProps {
    chips: ChipEntry[];
    onChange: (chips: ChipEntry[]) => void;
}

export default function ChipsField({ chips, onChange }: ChipsFieldProps) {
    const [kind, setKind] = useState(CHIP_KINDS[0]);
    const [value, setValue] = useState('');

    function handleKindChange(values: string[]) {
        const next = values[0];
        if (next) setKind(next as AlbumTagKind);
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
                <Dropdown
                    className={cls.KindDropdown}
                    options={KIND_OPTIONS}
                    value={[kind]}
                    onChange={handleKindChange}
                />
                <Input
                    value={value}
                    setValue={setValue}
                    onKeyDown={handleKeyDown}
                    placeholder="add tag…"
                    className={cls.ValueInputWrapper}
                    inputClassName={cls.ValueInput}
                />
                <Button variant="unstyled" className={cls.AddButton} onClick={handleAdd} aria-label="add tag">
                    +
                </Button>
            </div>
        </div>
    );
}
