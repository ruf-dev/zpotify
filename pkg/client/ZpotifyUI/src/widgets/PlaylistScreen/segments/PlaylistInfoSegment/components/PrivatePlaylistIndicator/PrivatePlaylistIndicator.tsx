import PrivateLockIcon from '@/assets/icons/PrivateLockIcon.tsx';
import cls from '@/widgets/PlaylistScreen/segments/PlaylistInfoSegment/components/PrivatePlaylistIndicator/PrivatePlaylistIndicator.module.css';

export default function PrivatePlaylistIndicator() {
    return (
        <span
            className={cls.PrivatePlaylistIndicator}
            data-tooltip-id="root-tooltip"
            data-tooltip-content="This playlist is private"
        >
            <PrivateLockIcon width={14} height={14} />
        </span>
    );
}
