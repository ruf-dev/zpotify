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
    avatarFallbackUrl?: string;
    avatarFallbackLabel?: string;
}

export default function CoverWithFallback(props: CoverWithFallbackProps) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [avatarFailed, setAvatarFailed] = useState(false);

    useEffect(
        function resetAvatarFailure() {
            setAvatarFailed(false);
        },
        [props.avatarFallbackUrl],
    );

    function handleAvatarError() {
        setAvatarFailed(true);
    }

    useEffect(() => {
        const coverUrl = props.coverUrl;
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
    }, [props.coverUrl]);

    if (props.coverUrl) {
        return (
            <img
                src={objectUrl ?? props.coverUrl}
                alt={props.name ?? ''}
                className={cn(cls.CoverImage, props.className)}
            />
        );
    }

    if (props.avatarFallbackUrl && !avatarFailed) {
        return (
            <div className={cn(cls.AvatarCoverContainer, props.className)}>
                <img
                    src={props.avatarFallbackUrl}
                    alt={props.name ?? ''}
                    className={cls.AvatarCoverImage}
                    onError={handleAvatarError}
                />
                {props.avatarFallbackLabel && <span className={cls.AvatarCoverLabel}>{props.avatarFallbackLabel}</span>}
            </div>
        );
    }

    const resolvedSeed = props.seed ?? resolveCoverSeed({ coverFilePath: props.coverFilePath, uuid: props.uuid });
    return <GenerativeCover seed={resolvedSeed} size={220} borderRadius="0" fluid />;
}
