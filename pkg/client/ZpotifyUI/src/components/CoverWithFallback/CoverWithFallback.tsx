import cn from 'classnames';
import { useEffect, useState } from 'react';

import cls from '@/components/CoverWithFallback/CoverWithFallback.module.css';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';
import { resolveCoverSeed } from '@/shared/lib/coverSeed.ts';
import { cacheCover, getCachedCover } from '@/shared/lib/coverCache.ts';
import { useCoverCacheStore } from '@/shared/model/coverCacheStore.ts';

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
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        setObjectUrl(null);
        if (!coverUrl) return undefined;

        let cancelled = false;
        let createdUrl: string | null = null;

        function handleCacheHit(blob: Blob | null) {
            if (cancelled) return;

            if (blob) {
                createdUrl = URL.createObjectURL(blob);
                setObjectUrl(createdUrl);
                return;
            }

            cacheCover(coverUrl!)
                .then(handleCacheStored)
                .catch(() => {});
        }

        function handleCacheStored(cached: boolean) {
            if (cancelled || !cached) return;

            useCoverCacheStore.getState().addCachedUrl(coverUrl!);
        }

        getCachedCover(coverUrl)
            .then(handleCacheHit)
            .catch(() => handleCacheHit(null));

        return function cleanup() {
            cancelled = true;
            if (createdUrl) URL.revokeObjectURL(createdUrl);
        };
    }, [coverUrl]);

    if (coverUrl) {
        return <img src={objectUrl ?? coverUrl} alt={name ?? ''} className={cn(cls.CoverImage, className)} />;
    }

    const resolvedSeed = seed ?? resolveCoverSeed({ coverFilePath, uuid });
    return <GenerativeCover seed={resolvedSeed} size={220} borderRadius="0" fluid />;
}
