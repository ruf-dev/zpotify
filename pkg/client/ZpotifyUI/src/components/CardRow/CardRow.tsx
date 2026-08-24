import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import cls from '@/components/CardRow/CardRow.module.css';

export interface CardRowProps {
    title: string;
    children: ReactNode;
}

export default function CardRow({ title, children }: CardRowProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = scrollAreaRef.current;
        if (!node) {
            return;
        }

        function handleWheel(event: WheelEvent) {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }
            node!.scrollLeft += event.deltaY;
            event.preventDefault();
        }

        node.addEventListener('wheel', handleWheel, { passive: false });
        return () => node.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <div className={cls.CardRowContainer}>
            <h2 className={cls.Title}>{title}</h2>
            <div ref={scrollAreaRef} className={cls.ScrollArea}>
                {children}
            </div>
        </div>
    );
}
