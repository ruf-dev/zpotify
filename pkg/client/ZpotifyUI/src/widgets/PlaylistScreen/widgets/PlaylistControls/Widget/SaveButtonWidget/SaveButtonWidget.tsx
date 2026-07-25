import IconButton from '@/components/IconButton/IconButton.tsx';
import { useSaveButtonWidget } from '@/widgets/PlaylistScreen/widgets/PlaylistControls/Widget/SaveButtonWidget/useSaveButtonWidget.ts';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';

export interface SaveButtonWidgetProps {
    uuid: string;
    isSaved: boolean;
}

export default function SaveButtonWidget({ uuid, isSaved }: SaveButtonWidgetProps) {
    const { saved, handleToggleSave } = useSaveButtonWidget({ uuid, isSaved });

    return (
        <IconButton
            active={saved}
            ariaLabel={saved ? 'Remove from library' : 'Save to library'}
            onClick={handleToggleSave}
        >
            <HeartIcon filled={saved} />
        </IconButton>
    );
}
