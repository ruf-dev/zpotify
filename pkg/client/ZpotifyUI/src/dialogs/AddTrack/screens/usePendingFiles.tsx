import { useEffect, useState } from 'react';
import { ConfirmDialog } from '@vervstack/chures';

import type { SongFile } from '@/app/api/zpotify';
import { fileService } from '@/shared/api/FileService.ts';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';

export function usePendingFiles() {
    const [files, setFiles] = useState<SongFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refetching, setRefetching] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();

    function fetchFiles() {
        return fileService.ListUploadedFiles({ temporaryOnly: true }).then((res) => setFiles(res.files || []));
    }

    useEffect(() => {
        fetchFiles().finally(() => setLoading(false));
    }, []);

    function refetch() {
        setRefetching(true);
        fetchFiles()
            .catch((err) => toaster.catch(err))
            .finally(() => setRefetching(false));
    }

    const allSelected = files.length > 0 && selectedIds.size === files.length;

    function handleToggleSelect(file: SongFile, checked: boolean) {
        const fileId = file.id ?? '';

        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(fileId);
            } else {
                next.delete(fileId);
            }
            return next;
        });
    }

    function handleToggleSelectAll(checked: boolean) {
        setSelectedIds(checked ? new Set(files.map((f) => f.id ?? '')) : new Set());
    }

    function handleToggleSelectFolder(fileIds: string[], checked: boolean) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            fileIds.forEach((id) => {
                if (checked) next.add(id);
                else next.delete(id);
            });
            return next;
        });
    }

    function handleDelete(file: SongFile) {
        const name = file.path?.split('/').pop() ?? 'this file';

        function handleConfirm() {
            return fileService
                .DeleteFile({ fileId: file.id })
                .then(() => {
                    setFiles((prev) => prev.filter((f) => f.id !== file.id));
                    setSelectedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(file.id ?? '');
                        return next;
                    });
                })
                .catch((err) => toaster.catch(err));
        }

        OpenDialog(
            <ConfirmDialog
                title="Delete file"
                message={`Delete "${name}"? This can't be undone.`}
                confirmLabel="Delete"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
    }

    function handleDeleteSelected() {
        const idsToDelete = Array.from(selectedIds);

        function handleConfirm() {
            return fileService
                .BatchDeleteFiles({ fileIds: idsToDelete })
                .then(() => {
                    setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id ?? '')));
                    setSelectedIds(new Set());
                })
                .catch((err) => toaster.catch(err));
        }

        OpenDialog(
            <ConfirmDialog
                title="Delete files"
                message={`Delete ${idsToDelete.length} selected file${idsToDelete.length === 1 ? '' : 's'}? This can't be undone.`}
                confirmLabel="Delete"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
    }

    return {
        files,
        loading,
        refetching,
        refetch,
        selectedIds,
        allSelected,
        handleToggleSelect,
        handleToggleSelectAll,
        handleToggleSelectFolder,
        handleDelete,
        handleDeleteSelected,
    };
}
