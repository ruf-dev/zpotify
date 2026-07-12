import { Input } from '@vervstack/chures';

import cls from '@/widgets/PlaylistScreen/components/TrackCountLabel/TrackCountLabel.module.css';

export interface TrackCountLabelProps {
    displayValue: string;
    isEditing: boolean;
    totalDuration: string;
}

function noop() {}

export default function TrackCountLabel({ displayValue, isEditing, totalDuration }: TrackCountLabelProps) {
    return (
        <>
            {isEditing ? (
                <Input
                    type="number"
                    value={displayValue}
                    setValue={noop}
                    readOnly
                    className={cls.InputWrapper}
                    inputClassName={cls.Input}
                />
            ) : (
                <span className={cls.Display}>{displayValue}</span>
            )}
            {isEditing && <span>tracks</span>}
            <span>·</span>
            <span>{totalDuration}</span>
        </>
    );
}
