import { useState } from 'react';

import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import { flattenDroppedInput, createInitialTracks } from '@/dialogs/MultitrackUpload/useTrackDrafts';
import { useUploadQueue } from '@/dialogs/MultitrackUpload/useUploadQueue';
import { isImageFile } from '@/features/upload/imageFile.ts';
import type { DroppedFolder } from '@/features/upload/resolveDroppedEntries.ts';

export interface BatchUploadState {
    folders: DroppedFolder[];
    tracks: TrackDraft[];
    startBatch: (folders: DroppedFolder[], looseFiles: File[]) => void;
}

// Dialog-scoped batch upload: mounted once at AddTrackDialog's root so the
// upload queue survives internal step navigation and is only torn down when
// the whole dialog unmounts.
export function useBatchUpload(): BatchUploadState {
    const [folders, setFolders] = useState<DroppedFolder[]>([]);
    const [tracks, setTracks] = useState<TrackDraft[]>([]);

    const uploadQueue = useUploadQueue(setTracks);

    function startBatch(newFolders: DroppedFolder[], looseFiles: File[]) {
        const audioOnly = flattenDroppedInput(looseFiles, newFolders).filter((t) => !isImageFile(t.file));
        const initial = createInitialTracks(audioOnly);
        setFolders(newFolders);
        setTracks(initial);
        initial.forEach((t) => uploadQueue.startUpload(t));
    }

    return { folders, tracks, startBatch };
}
