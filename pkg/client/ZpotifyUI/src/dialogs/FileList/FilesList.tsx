import React, { useEffect, useState } from 'react';
import { ModalClose } from '@vervstack/chures';

import cls from '@/dialogs/FileList/FilesList.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import type { SongFile } from '@/app/api/zpotify';
import Button from '@/shared/ui/Button.tsx';
import SongEditDialog from '@/dialogs/SongEdit/SongEditDialog.tsx';
import { fileService } from '@/shared/api/FileService.ts';
import { useBackGuard } from '@/shared/lib/useBackGuard';

interface FilesListProps {
    previousScreen?: React.JSX.Element;
}

export default function FilesList({ previousScreen }: FilesListProps) {
    const { OpenDialog, CloseDialog } = useDialog();
    const [files, setFiles] = useState<SongFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useBackGuard(!!previousScreen, () => OpenDialog(previousScreen!));

    useEffect(() => {
        fileService
            .ListUploadedFiles({})
            .then((res) => {
                setFiles(res.files || []);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    function handleBackClick() {
        if (previousScreen) {
            OpenDialog(previousScreen);
        }
    }

    function handleFileClick(file: SongFile) {
        OpenDialog(
            <SongEditDialog
                fileId={file.id || ''}
                path={file.path || ''}
                previousScreen={<FilesList previousScreen={previousScreen} />}
            />,
        );
    }

    if (isLoading) {
        return <div className={cls.FilesListContainer}>Loading...</div>;
    }

    return (
        <div className={cls.FilesListContainer}>
            <div className={cls.CloseButton}>
                <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />
            </div>
            <div className={cls.Header}>
                {previousScreen && <Button title="<" onClick={handleBackClick} />}
                Choose from uploaded
            </div>
            <div className={cls.List}>
                {files.length === 0 ? (
                    <div className={cls.Empty}>No files found</div>
                ) : (
                    files.map((file) => (
                        <div key={file.id} className={cls.FileItem} onClick={() => handleFileClick(file)}>
                            <div className={cls.FileName}>{file.path?.split('/').pop() || 'Unknown File'}</div>
                            <div className={cls.FilePath}>{file.path}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
