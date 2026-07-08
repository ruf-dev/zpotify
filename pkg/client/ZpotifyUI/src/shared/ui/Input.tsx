import { useState } from 'react';
import cn from 'classnames';

import cls from '@/shared/ui/Input.module.css';

export interface StyleProps {
    borderless?: boolean;
}

export interface InputProps {
    label?: string;
    inputValue: string | null;
    onChange: (v: string) => void;

    onLeave?: (val: string) => void;

    style?: StyleProps;

    disabled?: boolean;

    hint?: string;
}

export default function Input({ label, onChange, inputValue, style, onLeave, disabled, hint }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = inputValue !== undefined && inputValue !== null && inputValue.toString().length > 0;
    const showFloatingLabel = isFocused || hasValue;

    function handleFocus() {
        if (disabled) {
            return;
        }
        setIsFocused(true);
    }

    function handleBlur() {
        setIsFocused(false);
        if (onLeave) onLeave(inputValue || '');
    }

    return (
        <div
            className={cn(cls.InputContainer, {
                [cls.Borderless]: style?.borderless,
                [cls.Disabled]: disabled,
            })}
        >
            {/* TODO: switch to chures Input once it supports a hint-icon slot and an onLeave/blur-commit hook */}
            {/* eslint-disable-next-line no-restricted-syntax -- chures Input's markup has no slot for the hint icon and no onLeave (blur-commit) hook; this is the app's own generic Input wrapper */}
            <input
                className={cn(cls.input, {
                    [cls.Disabled]: disabled,
                })}
                disabled={(onChange === undefined && onLeave == undefined) || disabled}
                onChange={(e) => {
                    if (onChange) onChange(e.target.value);
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={inputValue || ''}
            />
            {label && <label className={cn(cls.Label, showFloatingLabel && cls.Floating)}>{label}</label>}
            {hint && (
                <img
                    className={cls.Hint}
                    alt={'?'}
                    data-tooltip-id={'tooltip'}
                    data-tooltip-content={hint}
                    data-tooltip-place="top"
                />
            )}
        </div>
    );
}
