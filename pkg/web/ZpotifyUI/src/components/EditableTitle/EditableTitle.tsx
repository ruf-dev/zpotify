import { useEffect, useRef, useState } from 'react';

import cls from './EditableTitle.module.css';

interface EditableTitleProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function EditableTitle({ value, onChange, placeholder = 'untitled' }: EditableTitleProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.select();
        }
    }, [editing]);

    function handleClick() {
        setDraft(value);
        setEditing(true);
    }

    function commit() {
        const trimmed = draft.trim();
        onChange(trimmed || value);
        setEditing(false);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            commit();
        } else if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
        }
    }

    if (editing) {
        return (
            <input
                ref={inputRef}
                className={cls.Input}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={handleKeyDown}
                aria-label="rename track"
            />
        );
    }

    return (
        <span className={`${cls.Display} ${!value ? cls.Empty : ''}`} onClick={handleClick} title="click to rename">
            {value || placeholder}
        </span>
    );
}
