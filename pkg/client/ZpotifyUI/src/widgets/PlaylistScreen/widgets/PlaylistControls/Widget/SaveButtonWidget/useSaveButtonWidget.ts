import { useEffect, useState } from 'react';

import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export interface UseSaveButtonWidgetParams {
    uuid: string;
    isSaved: boolean;
}

export function useSaveButtonWidget({ uuid, isSaved }: UseSaveButtonWidgetParams) {
    const [saved, setSaved] = useState(isSaved);
    const toaster = useToaster();

    useEffect(() => {
        setSaved(isSaved);
    }, [uuid, isSaved]);

    function handleToggleSave() {
        const next = !saved;
        setSaved(next);

        const request = next ? playlistService.FollowPlaylist(uuid) : playlistService.UnfollowPlaylist(uuid);
        void request.catch((e: unknown) => {
            setSaved(!next);
            toaster.catch(e as never);
        });
    }

    return { saved, handleToggleSave };
}
