import cn from 'classnames';

import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/components/GenreChipsRow/GenreChipsRow.module.css';
import type { AlbumTag } from '@/app/api/zpotify';

export interface GenreChipsRowProps {
    tags: AlbumTag[];
}

export default function GenreChipsRow({ tags }: GenreChipsRowProps) {
    return (
        <div className={cn(cls.GenreChipsRow, cls.FadeIn)}>
            {tags.map((tag) => (
                <span key={`${tag.kind}:${tag.value}`} className={cls.GenreChip}>
                    {tag.value}
                </span>
            ))}
        </div>
    );
}
