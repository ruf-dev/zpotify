import { useState } from 'react';
import cn from 'classnames';

import cls from '@/shared/ui/FloatInput.module.css';

interface FloatInputProps {
    value: string;
    onChange: (v: string) => void;
    type?: 'text' | 'password';
    label: string;
    autoFocus?: boolean;
}

export default function FloatInput({ value, onChange, type = 'text', label, autoFocus }: FloatInputProps) {
    const [focused, setFocused] = useState(false);
    const lifted = focused || value.length > 0;

    return (
        <div className={cls.Wrapper}>
            {/* TODO: switch to chures Input once it supports autoFocus/ref */}
            {/* eslint-disable-next-line no-restricted-syntax -- chures Input has no autoFocus/ref support; LoginViaPass relies on autoFocus for the username field */}
            <input
                className={cls.Input}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus={autoFocus}
            />
            <label className={cn(cls.Label, { [cls.lifted]: lifted })}>{label}</label>
        </div>
    );
}
