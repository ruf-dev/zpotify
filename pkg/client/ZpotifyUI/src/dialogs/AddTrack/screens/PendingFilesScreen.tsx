import { useEffect, useState } from 'react';

import cls from '@/dialogs/AddTrack/screens/PendingFilesScreen.module.css';
import type { SongFile } from '@/app/api/zpotify';
import { fileService } from '@/shared/api/FileService.ts';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import FileItem from '@/dialogs/AddTrack/screens/components/FileItem/FileItem';

export default function PendingFilesScreen({ handleSelectFromLibrary }: AddTrackContext) {
    const [files, setFiles] = useState<SongFile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fileService
            .ListUploadedFiles({ temporaryOnly: true })
            .then((res) => setFiles(res.files || []))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className={cls.PendingFilesScreenContainer}>
                <div className={cls.Loading}>loading files…</div>
            </div>
        );
    }

    return (
        <div className={cls.PendingFilesScreenContainer}>
            {files.length === 0 ? (
                <div className={cls.Empty}>no pending uploads found</div>
            ) : (
                <div className={cls.FileList}>
                    {files.map((file) => (
                        <FileItem key={file.id} file={file} onSelect={handleSelectFromLibrary} />
                    ))}
                </div>
            )}
        </div>
    );
}
