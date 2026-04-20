import {useEffect, useState} from "react";
import React from "react";

import cls from "@/dialogs/FileList/FilesList.module.css";

import {useDialog} from "@/app/hooks/Dialog.tsx";

import {User} from "@/hooks/user/User.ts";
import {SongFile} from "@/app/api/zpotify";

import Button from "@/components/shared/Button.tsx";
import Chip from "@/components/shared/Chip.tsx";
import SongEditDialog from "@/dialogs/SongEdit/SongEditDialog.tsx";


interface FilesListProps {
    user: User;
    previousScreen?: React.JSX.Element;
}

export default function FilesList({user, previousScreen}: FilesListProps) {
    const {OpenDialog, CloseDialog} = useDialog();
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
            <div className={cls.CloseButton}>
                <Chip value="×" onClick={CloseDialog}/>
            </div>
            <div className={cls.Header}>
                {previousScreen && (
                    <Button
                        title="<"
                        onClick={() => OpenDialog(previousScreen)}
                    />
                )}
                Choose from uploaded
            </div>
            <div className={cls.List}>
                {files.length === 0 ? (
                    <div className={cls.Empty}>No files found</div>
                ) : (
                    files.map(file => (
                        <div
                            key={file.id}
                            className={cls.FileItem}
                            onClick={() => OpenDialog(
                                <SongEditDialog
                                    path={file.path || ''}
                                    previousScreen={<FilesList user={user} previousScreen={previousScreen}/>}
                                />
                            )}
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
