import cls from '@/widgets/PlaylistScreen/segments/NotFoundPlaylistInfoSegment/NotFoundPlaylistInfoSegment.module.css';
import BackButton from '@/shared/ui/BackButton.tsx';

export interface NotFoundPlaylistInfoSegmentProps {
    onBack: () => void;
}

export default function NotFoundPlaylistInfoSegment({ onBack }: NotFoundPlaylistInfoSegmentProps) {
    return (
        <div className={cls.PlaylistInfoContainer}>
            <BackButton onClick={onBack} />
            <div className={cls.ErrorState}>
                <span className={cls.ErrorIcon}>!</span>
                <p className={cls.ErrorTitle}>Playlist not found</p>
                <p className={cls.ErrorHint}>This playlist may have been removed or is unavailable.</p>
            </div>
        </div>
    );
}
