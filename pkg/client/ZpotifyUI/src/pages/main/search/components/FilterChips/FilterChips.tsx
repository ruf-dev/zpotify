import cn from 'classnames';
import { Button } from '@vervstack/chures';

import type { SearchFilters } from '@/shared/api/SearchService.ts';
import cls from '@/pages/main/search/components/FilterChips/FilterChips.module.css';

export type FilterKey = keyof SearchFilters;

const FILTER_LABELS: { key: FilterKey; label: string }[] = [
    { key: 'artists', label: 'Artists' },
    { key: 'albums', label: 'Albums' },
    { key: 'playlists', label: 'Playlists' },
];

interface FilterChipsProps {
    active: SearchFilters;
    onToggle: (key: FilterKey) => void;
}

export default function FilterChips({ active, onToggle }: FilterChipsProps) {
    function handleClick(key: FilterKey) {
        return function handler() {
            onToggle(key);
        };
    }

    return (
        <div className={cls.FilterChipsContainer}>
            {FILTER_LABELS.map(function renderChip(filter) {
                return (
                    <Button
                        key={filter.key}
                        className={cn(cls.Chip, active[filter.key] && cls.ChipActive)}
                        onClick={handleClick(filter.key)}
                    >
                        {filter.label}
                    </Button>
                );
            })}
        </div>
    );
}
