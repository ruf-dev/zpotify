import { useState } from 'react';

import Chip from '@/components/Chip/Chip';
import cls from '@/widgets/ChipsField/ChipsField.module.css';

export type ChipEntry = { kind: string; value: string };

const CHIP_KINDS = ['genre', 'mood', 'era', 'vibe', 'language', 'theme'];

export interface ChipsFieldProps {
    chips: ChipEntry[];
    onChange: (chips: ChipEntry[]) => void;
}

export default function ChipsField({ chips, onChange }: ChipsFieldProps) {
    const [kind, setKind] = useState(CHIP_KINDS[0]);
    const [value, setValue] = useState('');

    function handleKindChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setKind(e.target.value);
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
                            label={`${chip.kind}: ${chip.value}`}
                            onRemove={function removeChip() { handleRemove(i); }}
                        />
                    ))}
                </div>
            )}
            <div className={cls.AddRow}>
                <select className={cls.KindSelect} value={kind} onChange={handleKindChange}>
                    {CHIP_KINDS.map((k) => (
                        <option key={k} value={k}>{k}</option>
                    ))}
                </select>
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
