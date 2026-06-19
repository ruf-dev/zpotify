import React, { useEffect, useState } from 'react';

import cls from '@/dialogs/FileList/FilesList.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import type { SongFile } from '@/app/api/zpotify';
import Button from '@/shared/ui/Button.tsx';
import Chip from '@/shared/ui/Chip.tsx';
import SongEditDialog from '@/dialogs/SongEdit/SongEditDialog.tsx';
import { fileService } from '@/shared/api/FileService.ts';

interface FilesListProps {
    previousScreen?: React.JSX.Element;
}

export default function FilesList({ previousScreen }: FilesListProps) {
    const { OpenDialog, CloseDialog } = useDialog();
    const [files, setFiles] = useState<SongFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return <div className={cls.FilesList}>Loading...</div>;
    }

    return (
        <div className={cls.FilesList}>
            <div className={cls.CloseButton}>
                <Chip value="×" onClick={CloseDialog} />
            </div>
            <div className={cls.Header}>
                {previousScreen && <Button title="<" onClick={() => OpenDialog(previousScreen)} />}
                Choose from uploaded
            </div>
            <div className={cls.List}>
                {files.length === 0 ? (
                    <div className={cls.Empty}>No files found</div>
                ) : (
                    files.map((file) => (
                        <div
                            key={file.id}
                            className={cls.FileItem}
                            onClick={() =>
                                OpenDialog(
                                    <SongEditDialog
                                        fileId={file.id || ''}
                                        path={file.path || ''}
                                        previousScreen={<FilesList previousScreen={previousScreen} />}
                                    />,
                                )
                            }
                        >
                            <div className={cls.FileName}>{file.path?.split('/').pop() || 'Unknown File'}</div>
                            <div className={cls.FilePath}>{file.path}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
