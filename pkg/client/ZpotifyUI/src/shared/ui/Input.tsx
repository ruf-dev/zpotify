import { Input as ChuresInput } from '@vervstack/chures';
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
    const value = inputValue || '';

    function handleBlur() {
        if (onLeave) onLeave(value);
    }

    return (
        <ChuresInput
            value={value}
            setValue={onChange}
            label={label}
            disabled={(onChange === undefined && onLeave == undefined) || disabled}
            onBlur={handleBlur}
            inputClassName={cn(cls.InputField, style?.borderless && cls.Borderless)}
            endIcon={
                hint ? (
                    <img
                        className={cls.Hint}
                        alt={'?'}
                        data-tooltip-id={'tooltip'}
                        data-tooltip-content={hint}
                        data-tooltip-place="top"
                    />
                ) : undefined
            }
        />
    );
}
