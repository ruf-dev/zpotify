import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import cn from 'classnames';

import cls from '@/features/upload/DropZone.module.css';

interface DropZoneProps {
    onFiles: (files: File[]) => void;
    accept?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function DropZone({ onFiles, accept = 'audio/*', className, children }: DropZoneProps) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('audio/'));
        if (files.length > 0) onFiles(files);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleDragLeave() {
        setDragOver(false);
    }

    function handleClick() {
        inputRef.current?.click();
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) onFiles(files);
        e.target.value = '';
    }

    return (
        <div
            className={cn(cls.DropZoneContainer, dragOver && cls.DragOver, className)}
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple
                className={cls.HiddenInput}
                onChange={handleInputChange}
            />
            {children}
            {dragOver && (
                <div className={cls.DragOverlay}>
                    <span className={cls.DragOverlayLabel}>drop to add</span>
                </div>
            )}
        </div>
    );
}
