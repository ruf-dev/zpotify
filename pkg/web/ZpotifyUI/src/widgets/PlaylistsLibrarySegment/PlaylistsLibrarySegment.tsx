import {useEffect, useState} from 'react';
import {useToaster} from '@/shared/lib/toaster/ToasterZ.ts';
import {playlistService} from '@/shared/api/PlaylistService.ts';
import type {LibraryItem} from '@/widgets/PlaylistsLibrarySegment/model.ts';
import LibraryGridScreen from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreen.tsx';
import LibraryGridScreenSkeleton from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreenSkeleton.tsx';
import cls from '@/widgets/PlaylistsLibrarySegment/screens/LibraryGridScreen/LibraryGridScreen.module.css';

export default function PlaylistsLibrarySegment() {
    const toaster = useToaster();
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(fetchLibrary, []);

    function fetchLibrary() {
        playlistService.ListLibrary({limit: 50, offset: 0})
            .then(setItems)
            .catch(toaster.catch)
            .finally(() => setLoading(false));
    }

    if (loading) {
        return (
            <div className={cls.PlaylistsLibrarySegmentContainer}>
                <LibraryGridScreenSkeleton/>
            </div>
        );
    }

    return <LibraryGridScreen items={items}/>;
}
