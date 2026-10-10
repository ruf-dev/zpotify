import cls from '@/widgets/SearchHistoryDropdown/components/HistoryListSkeleton/HistoryListSkeleton.module.css';

const ROW_KEYS = [0, 1, 2];

export default function HistoryListSkeleton() {
    return (
        <div className={cls.HistoryListSkeletonContainer} role="status" aria-label="Loading search history">
            <div className={cls.Label} />
            {ROW_KEYS.map((key) => (
                <div key={key} className={cls.Row}>
                    <div className={cls.Icon} />
                    <div className={cls.Text} />
                </div>
            ))}
        </div>
    );
}
