import cls from '@/widgets/PlaylistScreen/components/PlaylistOwnerLabel/PlaylistOwnerLabel.module.css';

export interface PlaylistOwnerLabelProps {
    ownerUsername?: string;
}

export default function PlaylistOwnerLabel({ ownerUsername }: PlaylistOwnerLabelProps) {
    return (
        <span
            className={cls.OwnerName}
            data-tooltip-id="root-tooltip"
            data-tooltip-content="The user who created this playlist"
        >
            Author: {ownerUsername || 'Unknown'}
        </span>
    );
}
