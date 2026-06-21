import cn from 'classnames';

import CheckIcon from '@/assets/icons/CheckIcon.tsx';

import cls from '@/dialogs/MultitrackUpload/PlaylistToggleRow.module.css';

interface PlaylistToggleRowProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export default function PlaylistToggleRow({ checked, onChange }: PlaylistToggleRowProps) {
    function handleClick() {
        onChange(!checked);
    }

    return (
        <div className={cn(cls.ToggleContainer, checked && cls.ToggleChecked)}>
            <label className={cls.ToggleLabel} onClick={handleClick}>
                <div className={cn(cls.Checkbox, checked && cls.CheckboxChecked)}>
                    {checked && <CheckIcon />}
                </div>
                <div className={cls.ToggleTextStack}>
                    <span className={cls.ToggleMain}>create playlist from these tracks</span>
                    <span className={cls.ToggleSub}>group them as an album with shared cover, name, and artists</span>
                </div>
            </label>
        </div>
    );
}
