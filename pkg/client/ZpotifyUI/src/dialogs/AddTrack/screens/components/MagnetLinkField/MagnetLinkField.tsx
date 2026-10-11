import { useEffect, useState } from 'react';
import { Button } from '@vervstack/chures';

import cls from '@/dialogs/AddTrack/screens/components/MagnetLinkField/MagnetLinkField.module.css';
import Input from '@/shared/ui/Input.tsx';
import { hasMagnetPrefix } from '@/features/upload/magnetLink.ts';

interface MagnetLinkFieldProps {
    initialValue: string;
    disabled: boolean;
    onSubmit: (magnetUri: string) => void;
}

export default function MagnetLinkField({ initialValue, disabled, onSubmit }: MagnetLinkFieldProps) {
    const [value, setValue] = useState('');

    useEffect(() => {
        setValue((typed) => (typed === '' ? initialValue : typed));
    }, [initialValue]);

    function handleSubmit() {
        onSubmit(value.trim());
    }

    return (
        <div className={cls.MagnetLinkFieldContainer}>
            <div className={cls.InputWrapper}>
                <Input label="Magnet link" inputValue={value} onChange={setValue} disabled={disabled} />
            </div>
            <Button variant="primary" onClick={handleSubmit} disabled={disabled || !hasMagnetPrefix(value)}>
                Add
            </Button>
        </div>
    );
}
