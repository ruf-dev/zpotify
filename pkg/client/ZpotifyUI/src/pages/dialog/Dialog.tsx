import React, { useEffect, type DragEvent, type MouseEvent } from 'react';

import cls from '@/pages/dialog/Dialog.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';
import { useBackGuard } from '@/shared/lib/useBackGuard';

export default function Dialog() {
    const { children, CloseDialog } = useDialog();
    const isOpen = !!children;

    useBackGuard(isOpen, CloseDialog);

    useEffect(() => {
        if (!isOpen) return undefined;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                CloseDialog();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, CloseDialog]);

    function handleMouseDown(e: MouseEvent<HTMLDivElement>) {
        if (e.target === e.currentTarget) CloseDialog();
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    if (!children) return null;

    return (
        <div
            className={cls.DialogContainer}
            onMouseDown={handleMouseDown}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {children.map((v, idx) => {
                return <React.Fragment key={idx}>{v}</React.Fragment>;
            })}
        </div>
    );
}
