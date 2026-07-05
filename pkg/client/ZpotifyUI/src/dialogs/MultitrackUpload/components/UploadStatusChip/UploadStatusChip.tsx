import cn from 'classnames';

import cls from '@/dialogs/MultitrackUpload/components/UploadStatusChip/UploadStatusChip.module.css';
import { UploadArrowSmallIcon } from '@/assets/icons/UploadArrowSmallIcon';
import { UploadDoneIcon } from '@/assets/icons/UploadDoneIcon';
import type { TrackDraft } from '@/dialogs/MultitrackUpload/TrackRow';

interface UploadStatusChipProps {
    uploadStatus: TrackDraft['uploadStatus'];
    isExisting?: boolean;
}

export default function UploadStatusChip({ uploadStatus, isExisting }: UploadStatusChipProps) {
    if (uploadStatus === 'error') return null;
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
