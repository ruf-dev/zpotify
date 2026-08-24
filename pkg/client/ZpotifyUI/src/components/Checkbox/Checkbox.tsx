import cn from 'classnames';
import { CheckmarkIcon } from '@vervstack/chures';

import cls from '@/components/Checkbox/Checkbox.module.css';

export interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export default function Checkbox({ checked, onChange, label, disabled, className }: CheckboxProps) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(e.target.checked);
    }

    return (
        <label className={cn(cls.CheckboxContainer, disabled && cls.Disabled, className)}>
            {/* eslint-disable-next-line no-restricted-syntax -- chures has no Checkbox component; this is the local Checkbox atom that other components use instead of a raw input */}
            <input
                type="checkbox"
                className={cls.Input}
                checked={checked}
                disabled={disabled}
                onChange={handleChange}
            />
            <span className={cn(cls.Box, checked && cls.Checked)}>
                {checked && <CheckmarkIcon size={11} strokeWidth={2.5} />}
            </span>
            {label && <span className={cls.Label}>{label}</span>}
        </label>
    );
}
