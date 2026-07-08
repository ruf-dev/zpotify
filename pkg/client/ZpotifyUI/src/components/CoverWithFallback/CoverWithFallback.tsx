import cn from 'classnames';

import cls from '@/components/CoverWithFallback/CoverWithFallback.module.css';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';
import { resolveCoverSeed } from '@/shared/lib/coverSeed.ts';

interface CoverWithFallbackProps {
    coverUrl?: string | null;
    coverFilePath?: string;
    uuid?: string;
    name?: string;
    seed?: number;
    className?: string;
}

export default function CoverWithFallback({
    coverUrl,
    coverFilePath,
    uuid,
    name,
    seed,
    className,
}: CoverWithFallbackProps) {
    if (coverUrl) {
        return <img src={coverUrl} alt={name ?? ''} className={cn(cls.CoverImage, className)} />;
    }

    const resolvedSeed = seed ?? resolveCoverSeed({ coverFilePath, uuid });
    return <GenerativeCover seed={resolvedSeed} size={220} borderRadius="0" fluid />;
}
