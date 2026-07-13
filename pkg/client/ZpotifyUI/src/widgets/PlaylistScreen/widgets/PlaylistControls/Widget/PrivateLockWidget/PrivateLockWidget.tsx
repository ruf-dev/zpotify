import IconButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/IconButton/IconButton.tsx';
import { usePrivateLockWidget } from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/PrivateLockWidget/usePrivateLockWidget.ts';
import PrivateLockIcon from '@/assets/icons/PrivateLockIcon.tsx';

export interface PrivateLockWidgetProps {
    uuid: string;
    isPublic: boolean;
    canEdit?: boolean;
}

export default function PrivateLockWidget({ uuid, isPublic, canEdit }: PrivateLockWidgetProps) {
    const { localIsPublic, handleTogglePublic } = usePrivateLockWidget({ uuid, isPublic });

    if (!canEdit) return null;

    const label = localIsPublic ? 'Make playlist private' : 'Make playlist public';

    return (
        <IconButton active={!localIsPublic} ariaLabel={label} tooltip={label} onClick={handleTogglePublic}>
            <PrivateLockIcon />
        </IconButton>
    );
}
