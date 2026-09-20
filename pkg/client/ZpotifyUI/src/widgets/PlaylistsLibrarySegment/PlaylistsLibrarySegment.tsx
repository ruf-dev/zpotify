import { useEffect, useMemo, useState } from 'react';

import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { playlistService } from '@/shared/api/PlaylistService.ts';
import { getLikedPlaylistCoverFallback } from '@/entities/playlist/likedPlaylistCoverFallback.ts';
import { usePlaylistListRefresh } from '@/entities/playlist/usePlaylistListRefresh.ts';
import useUser from '@/entities/user/useUser.ts';
import type { LibraryItem } from '@/widgets/PlaylistsLibrarySegment/model.ts';
import LibraryGridScreen from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreen.tsx';
import LibraryGridScreenSkeleton from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreenSkeleton.tsx';
import cls from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreen.module.css';

export default function PlaylistsLibrarySegment() {
    const toaster = useToaster();
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const version = usePlaylistListRefresh((s) => s.version);
    const likedPlaylistId = useUser((s) => s.userData?.likedPlaylistId);
    const userAvatarUrl = useUser((s) => s.userData?.pictureUrl);

    useEffect(fetchLibrary, [version]);

    function fetchLibrary() {
        playlistService
            .ListLibrary({ limit: 50, offset: 0 })
            .then(setItems)
            .catch(toaster.catch)
            .finally(() => setLoading(false));
    }

    const itemsWithLikedCover = useMemo(
        function applyLikedCoverFallback() {
            return items.map((item) => ({
                ...item,
                ...getLikedPlaylistCoverFallback(item.uuid, item.name, likedPlaylistId, userAvatarUrl),
            }));
        },
        [items, likedPlaylistId, userAvatarUrl],
    );

    if (loading) {
        return (
            <div className={cls.PlaylistsLibrarySegmentContainer}>
                <LibraryGridScreenSkeleton />
            </div>
        );
    }

    return <LibraryGridScreen items={itemsWithLikedCover} />;
}
