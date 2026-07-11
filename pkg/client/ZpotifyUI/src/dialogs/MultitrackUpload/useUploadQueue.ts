import { useRef } from 'react';

import { webApiService } from '@/shared/api/WebApi.ts';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

// Upload strictly one file at a time so a batch does not saturate the uplink
// and starve every other request (audio, API, artwork). Tune here if needed.
const MAX_CONCURRENT_UPLOADS = 3;

export interface UploadQueue {
    startUpload: (track: TrackDraft) => void;
}

// Bounded upload queue: startUpload() enqueues, and at most
// MAX_CONCURRENT_UPLOADS run at once. Queued tracks stay 'pending'.
export function useUploadQueue(setTracks: React.Dispatch<React.SetStateAction<TrackDraft[]>>): UploadQueue {
    const uploadQueueRef = useRef<TrackDraft[]>([]);
    const activeUploadsRef = useRef(0);

    function pumpUploadQueue() {
        while (activeUploadsRef.current < MAX_CONCURRENT_UPLOADS && uploadQueueRef.current.length > 0) {
            const next = uploadQueueRef.current.shift()!;
            activeUploadsRef.current += 1;
            runUpload(next);
        }
    }

    function runUpload(t: TrackDraft) {
        if (!t.file) {
            activeUploadsRef.current -= 1;
            pumpUploadQueue();
            return;
        }
        const file = t.file;
        setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, uploadStatus: 'uploading' } : p)));
        webApiService
            .UploadFileWithProgress(file, (pct) => {
                setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, uploadProgress: pct } : p)));
            })
            .then((fileId) => {
                setTracks((prev) =>
                    prev.map((p) => (p.id === t.id ? { ...p, fileId, uploadProgress: 100, uploadStatus: 'done' } : p)),
                );
            })
            .catch(() => {
                setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, uploadStatus: 'error' } : p)));
            })
            .finally(() => {
                activeUploadsRef.current -= 1;
                pumpUploadQueue();
            });
    }

    function startUpload(t: TrackDraft) {
        uploadQueueRef.current.push(t);
        pumpUploadQueue();
    }

    return { startUpload };
}
