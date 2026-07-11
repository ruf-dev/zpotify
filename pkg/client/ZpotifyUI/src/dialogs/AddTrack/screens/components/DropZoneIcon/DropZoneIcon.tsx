import { DropZoneUploadIcon } from '@/assets/icons/DropZoneUploadIcon';
import { DropZoneTargetIcon } from '@/assets/icons/DropZoneTargetIcon';
import cls from '@/dialogs/AddTrack/screens/components/DropZoneIcon/DropZoneIcon.module.css';

interface DropZoneIconProps {
    dragOver: boolean;
}

export default function DropZoneIcon({ dragOver }: DropZoneIconProps) {
    if (dragOver) {
        return <DropZoneTargetIcon className={cls.IconDragOver} />;
    }
    return <DropZoneUploadIcon className={cls.IconIdle} />;
}
