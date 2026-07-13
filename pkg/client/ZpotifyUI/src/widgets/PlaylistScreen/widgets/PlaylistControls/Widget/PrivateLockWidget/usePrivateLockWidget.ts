import { useEffect, useState } from 'react';

import { playlistService } from '@/shared/api/PlaylistService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export interface UsePrivateLockWidgetParams {
    uuid: string;
    isPublic: boolean;
}

export function usePrivateLockWidget({ uuid, isPublic }: UsePrivateLockWidgetParams) {
    const [localIsPublic, setLocalIsPublic] = useState(isPublic);
    const toaster = useToaster();

    useEffect(() => {
        setLocalIsPublic(isPublic);
    }, [uuid, isPublic]);

    function handleTogglePublic() {
        const next = !localIsPublic;
        setLocalIsPublic(next);

        const request = playlistService.UpdatePlaylist(
            uuid,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            next,
        );
        void request.catch((e: unknown) => {
            setLocalIsPublic(!next);
            toaster.catch(e as never);
        });
    }

    return { localIsPublic, handleTogglePublic };
}
