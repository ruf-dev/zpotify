import cn from 'classnames';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/MultitrackUpload/components/UploadStatusChip/UploadStatusChip.module.css';
import { UploadArrowSmallIcon } from '@/assets/icons/UploadArrowSmallIcon';
import { UploadDoneIcon } from '@/assets/icons/UploadDoneIcon';
import { UploadErrorIcon } from '@/assets/icons/UploadErrorIcon';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

interface UploadStatusChipProps {
    uploadStatus: TrackDraft['uploadStatus'];
    isExisting?: boolean;
    uploadError?: string;
    onRetry: () => void;
}

export default function UploadStatusChip({ uploadStatus, isExisting, uploadError, onRetry }: UploadStatusChipProps) {
    if (uploadStatus === 'error') {
        return (
            <Button
                variant="iconDanger"
                className={cn(cls.StatusChip, cls.StatusChipError)}
                onClick={onRetry}
                aria-label="upload failed, click to retry"
                data-tooltip-id="root-tooltip"
                data-tooltip-content={`${uploadError ?? 'upload failed'} — click to retry`}
            >
                <UploadErrorIcon />
            </Button>
        );
    }
    const isUploading = uploadStatus === 'uploading' || uploadStatus === 'pending';
    return (
        <span
            className={cn(
                cls.StatusChip,
                isUploading ? cls.StatusChipUploading : cls.StatusChipDone,
                isExisting && cls.StatusChipExisting,
            )}
            title={isExisting ? 'already on server' : undefined}
        >
            {isUploading ? <UploadArrowSmallIcon /> : <UploadDoneIcon />}
        </span>
    );
}
