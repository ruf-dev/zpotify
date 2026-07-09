import cls from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.module.css';

export interface TrackCountLabelProps {
    displayValue: string;
    isEditing: boolean;
    totalDuration: string;
}

export default function TrackCountLabel({ displayValue, isEditing, totalDuration }: TrackCountLabelProps) {
    return (
        <>
            {isEditing ? (
                // eslint-disable-next-line no-restricted-syntax -- read-only numeric display matching the edit-mode meta row; chures Input has no matching labelless read-only mode
                <input type="number" className={cls.Input} value={displayValue} readOnly />
            ) : (
                <span className={cls.Display}>{displayValue}</span>
            )}
            {isEditing && <span>tracks</span>}
            <span>·</span>
            <span>{totalDuration}</span>
        </>
    );
}
