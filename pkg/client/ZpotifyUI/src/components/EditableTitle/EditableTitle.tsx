import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import cls from '@/components/EditableTitle/EditableTitle.module.css';

interface EditableTitleProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
    // Length of a leading substring of `value` to render as removable (e.g. previewing a strip-able prefix).
    highlightPrefixLength?: number;
    // When true, the highlighted prefix animates out (slide + fade) instead of just being shown.
    isRemovingPrefix?: boolean;
}

export default function EditableTitle({
    value,
    onChange,
    placeholder = 'untitled',
    readOnly,
    highlightPrefixLength = 0,
    isRemovingPrefix,
}: EditableTitleProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.select();
        }
    }, [editing]);

    function handleClick() {
        if (readOnly) return;
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
            // TODO: switch to chures Input once it supports ref/onKeyDown
            // eslint-disable-next-line no-restricted-syntax -- chures Input has no ref/onKeyDown support; this needs both for select-on-edit and Enter/Escape handling
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

    const prefix = value.slice(0, highlightPrefixLength);
    const rest = value.slice(highlightPrefixLength);

    return (
        <span
            className={cn(cls.Display, !value && cls.Empty, readOnly && cls.ReadOnly)}
            onClick={handleClick}
            title={readOnly ? undefined : 'click to rename'}
        >
            {value ? (
                highlightPrefixLength > 0 ? (
                    <>
                        <span className={cn(cls.RemovablePrefix, isRemovingPrefix && cls.RemovablePrefixExit)}>
                            {prefix}
                        </span>
                        {rest}
                    </>
                ) : (
                    value
                )
            ) : (
                placeholder
            )}
        </span>
    );
}
