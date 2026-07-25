import { useEffect, useRef, useState } from 'react';

import { webApiService } from '@/shared/api/WebApi.ts';

interface ActiveUpload {
    controller: AbortController;
    promise: Promise<string>;
}

export interface EagerFileUpload {
    progress: number | undefined;
    startUpload: (file: File) => void;
    resolveFileId: () => Promise<string | undefined>;
    cancel: () => void;
}

export function useEagerFileUpload(): EagerFileUpload {
    const [progress, setProgress] = useState<number | undefined>();
    const activeRef = useRef<ActiveUpload | undefined>(undefined);

    useEffect(() => {
        return () => {
            activeRef.current?.controller.abort();
            activeRef.current = undefined;
        };
    }, []);

    function startUpload(file: File) {
        activeRef.current?.controller.abort();

        const controller = new AbortController();
        setProgress(0);

        function onProgress(pct: number) {
            if (activeRef.current?.controller !== controller) return;
            setProgress(pct);
        }

        const promise = webApiService.UploadFileWithProgress(file, onProgress, controller.signal);
        activeRef.current = { controller, promise };

        promise.then(
            () => {
                if (activeRef.current?.controller !== controller) return;
                setProgress(undefined);
            },
            () => {
                if (activeRef.current?.controller !== controller) return;
                setProgress(undefined);
            },
        );
    }

    function resolveFileId(): Promise<string | undefined> {
        if (!activeRef.current) return Promise.resolve(undefined);
        return activeRef.current.promise;
    }

    function cancel() {
        activeRef.current?.controller.abort();
        activeRef.current = undefined;
        setProgress(undefined);
    }

    return { progress, startUpload, resolveFileId, cancel };
}
