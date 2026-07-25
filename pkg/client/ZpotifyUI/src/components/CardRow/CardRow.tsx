import type { ReactNode } from 'react';

import cls from '@/components/CardRow/CardRow.module.css';

export interface CardRowProps {
    title: string;
    children: ReactNode;
}

export default function CardRow({ title, children }: CardRowProps) {
    return (
        <div className={cls.CardRowContainer}>
            <h2 className={cls.Title}>{title}</h2>
            <div className={cls.ScrollArea}>{children}</div>
        </div>
    );
}
