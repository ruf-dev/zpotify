import IconButton from '@/widgets/PlaylistScreen/widgets/PlaylistControls/components/IconButton/IconButton.tsx';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';

export interface SaveButtonProps {
    saved: boolean;
    onToggleSave: () => void;
}

export default function SaveButton({ saved, onToggleSave }: SaveButtonProps) {
    return (
        <IconButton active={saved} ariaLabel={saved ? 'Remove from library' : 'Save to library'} onClick={onToggleSave}>
            <HeartIcon filled={saved} />
        </IconButton>
    );
}
