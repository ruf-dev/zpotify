import React, {useEffect, useRef} from 'react';

import cls from '@/pages/dialog/Dialog.module.css';
import {useDialog} from '@/app/hooks/Dialog.tsx';

export default function Dialog() {
    const {children, CloseDialog} = useDialog();
    const isOpen = !!children;
    const closedByPopStateRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;

        closedByPopStateRef.current = false;
        window.history.pushState({dialog: true}, '');

        function handlePopState() {
            closedByPopStateRef.current = true;
            CloseDialog();
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                CloseDialog();
            }
        }

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('keydown', handleKeyDown);

            if (!closedByPopStateRef.current) {
                window.history.back();
            }
        };
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
