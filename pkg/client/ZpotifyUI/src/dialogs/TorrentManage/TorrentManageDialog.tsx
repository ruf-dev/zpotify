import React, { useEffect, useState } from 'react';
import { Button, ConfirmDialog, ModalActions, ModalClose } from '@vervstack/chures';
import { MorphIcon } from 'morphicons/react';
import { Pause, Play } from 'lucide';

import cls from '@/dialogs/TorrentManage/TorrentManageDialog.module.css';
import modalCloseCls from '@/shared/ui/ModalCloseButton.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useToaster } from '@/shared/lib/toaster/ToasterZ.ts';
import { torrentService } from '@/shared/api/TorrentService.ts';
import { formatFileSize } from '@/shared/lib/files.ts';
import { isPausedTorrentStatus, isTerminalTorrentStatus } from '@/shared/lib/torrentStatus.ts';
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
    const [toggling, setToggling] = useState(false);

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
    const paused = isPausedTorrentStatus(job.status);
    const total = Number(job.totalBytes ?? 0);
    const downloaded = Number(job.downloadedBytes ?? 0);
    const importedFiles = job.importedFiles ?? [];

    function handlePause() {
        if (!job.id || toggling) return;
        setToggling(true);
        torrentService
            .PauseTorrentJob({ jobId: job.id })
            .then(() => setJob((prev) => ({ ...prev, status: 'paused' })))
            .catch((err) => toaster.catch(err))
            .finally(() => setToggling(false));
    }

    function handleResume() {
        if (!job.id || toggling) return;
        setToggling(true);
        torrentService
            .ResumeTorrentJob({ jobId: job.id })
            .then(() => setJob((prev) => ({ ...prev, status: 'downloading' })))
            .catch((err) => toaster.catch(err))
            .finally(() => setToggling(false));
    }

    function handleTogglePause() {
        if (paused) {
            handleResume();
        } else {
            handlePause();
        }
    }

    function handleDelete() {
        function handleConfirm() {
            if (!job.id) return Promise.resolve();
            return torrentService
                .DeleteTorrentJob({ jobId: job.id })
                .then(() => CloseDialog())
                .catch((err) => toaster.catch(err));
        }

        OpenDialog(
            <ConfirmDialog
                title="Delete torrent"
                message="This will permanently remove this torrent job and all downloaded data for it."
                confirmLabel="Delete"
                danger
                onConfirm={handleConfirm}
                onClose={CloseDialog}
            />,
        );
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
                    {!terminal && (
                        <Button
                            variant="ghost"
                            className={cls.PauseToggleButton}
                            onClick={handleTogglePause}
                            disabled={toggling}
                            aria-label={paused ? 'resume' : 'pause'}
                        >
                            <MorphIcon icon={paused ? Play : Pause} />
                        </Button>
                    )}
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
                            label: 'delete',
                            onClick: handleDelete,
                            className: cls.DeleteButton,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
