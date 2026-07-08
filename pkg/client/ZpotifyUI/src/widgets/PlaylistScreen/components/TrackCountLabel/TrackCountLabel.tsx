import cls from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.module.css';

export interface TrackCountLabelProps {
    displayValue: string;
    isEditing: boolean;
}

export default function TrackCountLabel({ displayValue, isEditing }: TrackCountLabelProps) {
    if (isEditing) {
        return (
            // eslint-disable-next-line no-restricted-syntax -- read-only numeric display matching the edit-mode meta row; chures Input has no matching labelless read-only mode
            <input type="number" className={cls.Input} value={displayValue} readOnly />
        );
    }

    return <span className={cls.Display}>{displayValue}</span>;
}
