import cls from '@/dialogs/AddTrack/screens/components/TorrentFilesSkeleton/TorrentFilesSkeleton.module.css';

interface Props {
    title: string;
}

const SKELETON_NAME_WIDTHS = ['55%', '40%', '60%', '35%', '50%', '45%'];

export default function TorrentFilesSkeleton({ title }: Props) {
    return (
        <div className={cls.TorrentFilesSkeletonContainer} aria-busy="true" aria-label="Loading torrent files">
            {title !== '' && <span className={cls.Title}>{title}</span>}
            <div className={cls.ActionsBlock} />
            {SKELETON_NAME_WIDTHS.map((width, index) => (
                <div key={index} className={cls.SkeletonRow}>
                    <div className={cls.CheckboxBlock} />
                    <div className={cls.NameBlock} style={{ width }} />
                    <div className={cls.SizeBlock} />
                </div>
            ))}
        </div>
    );
}
