import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/components/GenreChipsRow/GenreChipsRow.module.css';
import type { PlaylistChip } from '@/app/api/zpotify';

export interface GenreChipsRowProps {
    chips: PlaylistChip[];
}

export default function GenreChipsRow({ chips }: GenreChipsRowProps) {
    return (
        <div className={cn(cls.GenreChipsRow, cls.FadeIn)}>
            {chips.map((chip) => (
                <span key={`${chip.kind}:${chip.value}`} className={cls.GenreChip}>
                    {chip.value}
                </span>
            ))}
        </div>
    );
}
