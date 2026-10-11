import { useEffect, useRef } from 'react';
import cn from 'classnames';
import { CheckmarkIcon } from '@vervstack/chures';

import cls from '@/components/Checkbox/Checkbox.module.css';

export interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    isIndeterminate?: boolean;
    className?: string;
}

export default function Checkbox({ checked, onChange, label, disabled, isIndeterminate, className }: CheckboxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isMixed = isIndeterminate === true && !checked;

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = isMixed;
        }
    }, [isMixed]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(e.target.checked);
    }

    return (
        <label className={cn(cls.CheckboxContainer, disabled && cls.Disabled, className)}>
            {/* eslint-disable-next-line no-restricted-syntax -- chures has no Checkbox component; this is the local Checkbox atom that other components use instead of a raw input */}
            <input
                ref={inputRef}
                type="checkbox"
                className={cls.Input}
                checked={checked}
                disabled={disabled}
                onChange={handleChange}
            />
            <span className={cn(cls.Box, checked && cls.Checked, isMixed && cls.Indeterminate)}>
                {checked && <CheckmarkIcon size={11} strokeWidth={2.5} />}
                {isMixed && <span className={cls.Dash} />}
            </span>
            {label && <span className={cls.Label}>{label}</span>}
        </label>
    );
}
