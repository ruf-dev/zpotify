import React, { useEffect, useState } from 'react';
import { ModalActions, ModalClose } from '@vervstack/chures';

import cls from '@/dialogs/TorrentManage/TorrentManageDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { torrentService } from '@/shared/api/TorrentService.ts';
import { formatFileSize } from '@/shared/lib/files.ts';
import { isTerminalTorrentStatus } from '@/shared/lib/torrentStatus.ts';
import BackButton from '@/shared/ui/BackButton';
import { useBackGuard } from '@/shared/lib/useBackGuard';
import type { TorrentJob } from '@/app/api/zpotify';

interface TorrentManageDialogProps {
    job: TorrentJob;
    previousScreen?: React.JSX.Element;
}

export default function TorrentManageDialog({ job: initialJob, previousScreen }: TorrentManageDialogProps) {
    const { OpenDialog, CloseDialog } = useDialog();
    const toaster = useToaster();

    const [job, setJob] = useState<TorrentJob>(initialJob);
    const [canceling, setCanceling] = useState(false);

    useBackGuard(!!previousScreen, () => OpenDialog(previousScreen!));

    useEffect(() => {
        if (!initialJob.id) return;
        torrentService
            .GetTorrentJob({ jobId: initialJob.id })
            .then((res) => {
                if (res.job) setJob(res.job);
            })
            .catch(() => {});
    }, [initialJob.id]);

    const terminal = isTerminalTorrentStatus(job.status);
    const total = Number(job.totalBytes ?? 0);
    const downloaded = Number(job.downloadedBytes ?? 0);
    const importedFiles = job.importedFiles ?? [];

    function handleCancel() {
        if (!job.id || canceling) return;
        setCanceling(true);
        torrentService
            .CancelTorrentJob({ jobId: job.id })
            .then(() => setJob((prev) => ({ ...prev, status: 'canceled' })))
            .catch((err) => toaster.catch(err))
            .finally(() => setCanceling(false));
    }

    return (
        <div className={cls.TorrentManageDialogContainer}>
            <div className={cls.PanelHeader}>
                <div className={cls.PanelTitleGroup}>
                    {previousScreen && <BackButton onClick={() => OpenDialog(previousScreen)} />}
                    <span className={cls.PanelTitle}>torrent details</span>
                </div>
                <ModalClose className={modalCloseCls.ModalCloseButton} onClick={CloseDialog} />
            </div>

            <div className={cls.PanelBody}>
                <span className={cls.TorrentName}>{job.torrentName}</span>

                <div className={cls.StatusRow}>
                    <span className={cls.StatusBadge}>{job.status}</span>
                    <span className={cls.BytesLabel}>
                        {formatFileSize(downloaded)} / {formatFileSize(total)}
                    </span>
                </div>

                {job.error && <span className={cls.ErrorMessage}>{job.error}</span>}

                {importedFiles.length > 0 && (
                    <div className={cls.FileList}>
                        {importedFiles.map((file) => (
                            <div key={file.fileId ?? file.torrentPath} className={cls.FileRow}>
                                <span className={cls.FilePath}>{file.torrentPath}</span>
                                <span className={cls.FileStatus}>{file.status}</span>
                                {file.error && <span className={cls.FileError}>{file.error}</span>}
                            </div>
                        ))}
                    </div>
                )}

                <ModalActions
                    buttons={[
                        {
                            label: canceling ? 'canceling…' : 'cancel',
                            onClick: handleCancel,
                            className: cls.CancelButton,
                            disabled: terminal || canceling,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
