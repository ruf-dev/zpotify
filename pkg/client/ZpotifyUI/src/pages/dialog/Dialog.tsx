import React, { useEffect } from 'react';

import cls from '@/pages/dialog/Dialog.module.css';
import {useDialog} from '@/app/hooks/Dialog.tsx';
import { useBackGuard } from '@/shared/lib/useBackGuard';

export default function Dialog() {
    const {children, CloseDialog} = useDialog();
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

    if (!children) return null;

    return (
        <div className={cls.DialogContainer}
             onMouseDown={(e) => {
                 if (e.target === e.currentTarget) CloseDialog();
             }}
        >
                {children.map((v, idx) => {
                    return <React.Fragment key={idx}>{v}</React.Fragment>;
                })}
        </div>
    );
}
