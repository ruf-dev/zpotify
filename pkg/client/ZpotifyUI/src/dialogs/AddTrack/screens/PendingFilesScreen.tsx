import { useEffect, useState } from 'react';

import cls from '@/dialogs/AddTrack/screens/PendingFilesScreen.module.css';
import type { SongFile } from '@/app/api/zpotify';
import { fileService } from '@/shared/api/FileService.ts';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';

function FileItem({ file, onSelect }: { file: SongFile; onSelect: (f: SongFile) => void }) {
    const name = file.path?.split('/').pop() ?? 'unknown file';

    function handleClick() {
        onSelect(file);
    }

    return (
        <div className={cls.FileItem} onClick={handleClick}>
            <div className={cls.FileIcon}>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            </div>
            <span className={cls.FileName}>{name}</span>
        </div>
    );
}

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
