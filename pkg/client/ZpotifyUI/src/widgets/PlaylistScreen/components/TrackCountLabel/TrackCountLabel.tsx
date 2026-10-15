import cls from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.module.css';

export interface TrackCountLabelProps {
    displayValue: string;
    totalDuration: string;
    isSingle?: boolean;
}

export default function TrackCountLabel({ displayValue, totalDuration, isSingle }: TrackCountLabelProps) {
    if (isSingle) {
        return <span>{totalDuration}</span>;
    }

    return (
        <>
            <span className={cls.Display}>{displayValue}</span>
            <span>·</span>
            <span>{totalDuration}</span>
        </>
    );
}
