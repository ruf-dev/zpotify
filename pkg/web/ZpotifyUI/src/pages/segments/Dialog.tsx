import React from 'react';

import cls from '@/pages/segments/Dialog.module.css';
import { useDialog } from '@/app/hooks/Dialog.tsx';

export default function Dialog() {
    const { children, CloseDialog } = useDialog();

    if (!children) return null;

    return (
        <div
            className={cls.DialogContainer}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) CloseDialog();
            }}
        >
            <div
                className={cls.ChildrenWrapper}
                onMouseDown={(e) => {
                    e.stopPropagation();
                }}
            >
                {children.map((v, idx) => {
                    return <React.Fragment key={idx}>{v}</React.Fragment>;
                })}
            </div>
        </div>
    );
}
