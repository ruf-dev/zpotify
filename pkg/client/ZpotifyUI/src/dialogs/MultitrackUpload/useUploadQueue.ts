import { useEffect, useRef } from 'react';

import { webApiService } from '@/shared/api/WebApi.ts';
import { ServiceError } from '@/shared/api/Errors.ts';
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
    const activeControllersRef = useRef<Map<string, AbortController>>(new Map());

    // Leaving the page/closing the dialog must not leave uploads running
    // against a connection nobody is watching anymore: drop anything still
    // queued and abort every in-flight request.
    useEffect(() => {
        return function cancelAllUploads() {
            uploadQueueRef.current = [];
            activeControllersRef.current.forEach((controller) => controller.abort());
            activeControllersRef.current.clear();
        };
    }, []);

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
        const controller = new AbortController();
        activeControllersRef.current.set(t.id, controller);

        setTracks((prev) =>
            prev.map((p) =>
                p.id === t.id ? { ...p, uploadStatus: 'uploading', uploadError: undefined, uploadProgress: 0 } : p,
            ),
        );
        webApiService
            .UploadFileWithProgress(
                file,
                (pct) => {
                    setTracks((prev) => prev.map((p) => (p.id === t.id ? { ...p, uploadProgress: pct } : p)));
                },
                controller.signal,
                t.folderName,
            )
            .then((fileId) => {
                setTracks((prev) =>
                    prev.map((p) => (p.id === t.id ? { ...p, fileId, uploadProgress: 100, uploadStatus: 'done' } : p)),
                );
            })
            .catch((e: unknown) => {
                const message = e instanceof ServiceError ? e.title : 'upload failed';
                setTracks((prev) =>
                    prev.map((p) => (p.id === t.id ? { ...p, uploadStatus: 'error', uploadError: message } : p)),
                );
            })
            .finally(() => {
                activeControllersRef.current.delete(t.id);
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
