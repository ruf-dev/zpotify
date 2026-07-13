import cls from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.module.css';

export interface TrackCountLabelProps {
    displayValue: string;
    totalDuration: string;
}

export default function TrackCountLabel({ displayValue, totalDuration }: TrackCountLabelProps) {
    return (
        <>
            <span className={cls.Display}>{displayValue}</span>
            <span>·</span>
            <span>{totalDuration}</span>
        </>
    );
}
