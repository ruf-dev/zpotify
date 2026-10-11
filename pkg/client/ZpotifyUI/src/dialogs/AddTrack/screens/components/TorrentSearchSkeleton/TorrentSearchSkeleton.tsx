import cls from '@/dialogs/AddTrack/screens/components/TorrentSearchSkeleton/TorrentSearchSkeleton.module.css';

const SKELETON_ROW_COUNT = 5;
const SKELETON_ROWS = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

export default function TorrentSearchSkeleton() {
    return (
        <div className={cls.TorrentSearchSkeletonContainer}>
            {SKELETON_ROWS.map((index) => (
                <div key={index} className={cls.SkeletonRow}>
                    <div className={cls.TitleBlock} />
                    <div className={cls.MetaBlock} />
                </div>
            ))}
        </div>
    );
}
