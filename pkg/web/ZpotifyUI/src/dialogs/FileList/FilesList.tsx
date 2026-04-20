import {useEffect, useState} from "react";
import {SongFile} from "@/app/api/zpotify";

import cls from "@/dialogs/FileList/FilesList.module.css";
import {User} from "@/hooks/user/User.ts";


interface FilesListProps {
    user: User;
}

export default function FilesList({user}: FilesListProps) {
    const [files, setFiles] = useState<SongFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        user.Services().File().ListUploadedFiles({})
            .then(res => {
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
            <div className={cls.Header}>
                Choose from uploaded
            </div>
            <div className={cls.List}>
                {files.length === 0 ? (
                    <div className={cls.Empty}>No files found</div>
                ) : (
                    files.map(file => (
                        <div key={file.id} className={cls.FileItem}>
                            <div className={cls.FileName}>{file.path?.split('/').pop() || 'Unknown File'}</div>
                            <div className={cls.FilePath}>{file.path}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
