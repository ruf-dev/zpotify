import { Button, Toggle } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/PendingFilesScreen.module.css';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import FileItem from '@/dialogs/AddTrack/screens/components/FileItem/FileItem';
import { usePendingFiles } from '@/dialogs/AddTrack/screens/usePendingFiles.tsx';

export default function PendingFilesScreen({ handleSelectFromLibrary }: AddTrackContext) {
    const pendingFiles = usePendingFiles();

    if (pendingFiles.loading) {
        return (
            <div className={cls.PendingFilesScreenContainer}>
                <div className={cls.Loading}>loading files…</div>
            </div>
        );
    }

    return (
        <div className={cls.PendingFilesScreenContainer}>
            {pendingFiles.files.length === 0 ? (
                <div className={cls.Empty}>no pending uploads found</div>
            ) : (
                <>
                    <div className={cls.ActionsRow}>
                        <Toggle
                            checked={pendingFiles.allSelected}
                            onChange={pendingFiles.handleToggleSelectAll}
                            label="Select all"
                        />
                        <Button
                            variant="danger"
                            disabled={pendingFiles.selectedIds.size === 0}
                            onClick={pendingFiles.handleDeleteSelected}
                        >
                            Delete selected ({pendingFiles.selectedIds.size})
                        </Button>
                    </div>
                    <div className={cls.FileList}>
                        {pendingFiles.files.map((file) => (
                            <FileItem
                                key={file.id}
                                file={file}
                                selected={pendingFiles.selectedIds.has(file.id ?? '')}
                                onSelect={handleSelectFromLibrary}
                                onDelete={pendingFiles.handleDelete}
                                onToggleSelect={pendingFiles.handleToggleSelect}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
