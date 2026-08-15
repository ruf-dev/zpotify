import cn from 'classnames';

import MusicFileIcon from '@/assets/icons/MusicFileIcon';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';
import cls from '@/dialogs/AddTrack/screens/components/UploadingFileRow/UploadingFileRow.module.css';

interface UploadingFileRowProps {
    track: TrackDraft;
}

export default function UploadingFileRow({ track }: UploadingFileRowProps) {
    const isDone = track.uploadStatus === 'done';
    const isError = track.uploadStatus === 'error';

    return (
        <div
            className={cn(cls.UploadingFileRowContainer, isDone && cls.UploadDone, isError && cls.UploadError)}
            style={{ '--upload-pct': String(track.uploadProgress / 100) } as React.CSSProperties}
        >
            <div className={cls.ProgressFill} />

            <div className={cls.FileIcon}>
                <MusicFileIcon width={14} height={14} />
            </div>

            <span className={cls.FileName}>{track.title}</span>

            {isError ? (
                <span className={cls.ErrorLabel}>{track.uploadError ?? 'upload failed'}</span>
            ) : isDone ? (
                <span className={cls.StatusLabel}>done</span>
            ) : (
                <span className={cls.StatusLabel}>{Math.round(track.uploadProgress)}%</span>
            )}
        </div>
    );
}
