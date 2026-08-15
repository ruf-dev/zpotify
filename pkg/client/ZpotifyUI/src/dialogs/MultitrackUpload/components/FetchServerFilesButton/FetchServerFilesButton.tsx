import { useState } from 'react';
import { Button } from '@vervstack/chures';

import type { SongFile } from '@/app/api/zpotify';
import { fileService } from '@/shared/api/FileService.ts';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import type { ServiceError } from '@/shared/api/Errors.ts';
import cls from '@/dialogs/MultitrackUpload/components/FetchServerFilesButton/FetchServerFilesButton.module.css';

interface FetchServerFilesButtonProps {
    excludedFileIds: Set<string>;
    onAddPendingFile: (song: SongFile) => void;
}

export default function FetchServerFilesButton(props: FetchServerFilesButtonProps) {
    const [fetching, setFetching] = useState(false);
    const toaster = useToaster();

    function handleClick() {
        setFetching(true);
        fileService
            .ListUploadedFiles({ temporaryOnly: true })
            .then((res) => {
                (res.files ?? [])
                    .filter((f) => f.id && !props.excludedFileIds.has(f.id))
                    .forEach((f) => props.onAddPendingFile(f));
            })
            .catch((err: unknown) => toaster.catch(err as ServiceError))
            .finally(() => setFetching(false));
    }

    return (
        <Button
            type="button"
            variant="ghost"
            className={cls.FetchServerFilesButton}
            onClick={handleClick}
            disabled={fetching}
        >
            {fetching ? 'fetching…' : 'fetch server files'}
        </Button>
    );
}
