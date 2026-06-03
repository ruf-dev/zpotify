import {useRef, useState, type DragEvent, type ChangeEvent} from 'react';
import cls from '@/dialogs/AddTrack/screens/DropZoneScreen.module.css';

interface DropZoneScreenProps {
    onFile: (file: File) => void;
}

function IdleDecoration() {
    return (
        <>
            <svg className={cls.Ring1} width="176" height="176" viewBox="0 0 176 176" fill="none">
                <circle cx="88" cy="88" r="82" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 8" strokeLinecap="round"/>
            </svg>
            <svg className={cls.Ring2} width="128" height="128" viewBox="0 0 128 128" fill="none">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="1" strokeDasharray="4 14" strokeLinecap="round"/>
            </svg>
        </>
    );
}

function DragOverDecoration() {
    return (
        <>
            <div className={cls.DragBorder}/>
            <div className={cls.RadarPulse}/>
            <div className={`${cls.RadarPulse} ${cls.RadarPulse2}`}/>
            <div className={`${cls.RadarPulse} ${cls.RadarPulse3}`}/>
        </>
    );
}

function DropZoneIcon({dragOver}: {dragOver: boolean}) {
    if (dragOver) {
        return (
            <svg className={cls.IconDragOver} width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="22" cy="22" r="18"/>
                <path d="M22 14v14M15 27l7 7 7-7"/>
            </svg>
        );
    }
    return (
        <svg className={cls.IconIdle} width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 32V18M15 25l7-7 7 7"/>
            <path d="M10 36h24"/>
        </svg>
    );
}

function DropZoneText({dragOver}: {dragOver: boolean}) {
    if (dragOver) {
        return <span className={cls.TextDragOver}>release to upload</span>;
    }
    return (
        <>
            <span className={cls.TextIdle}>drop your track here</span>
            <span className={cls.TextSub}>or <u>click to browse</u></span>
        </>
    );
}

export default function DropZoneScreen({onFile}: DropZoneScreenProps) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (f) onFile(f);
    }

    function handleClick() {
        inputRef.current?.click();
    }

    function handleDragLeave() {
        setDragOver(false);
    }

    return (
        <div className={cls.DropZoneScreenContainer}>
            <div
                className={`${cls.DropZone} ${dragOver ? cls.DropZoneDragOver : ''}`}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="audio/*"
                    className={cls.HiddenInput}
                    onChange={handleInputChange}
                />

                {dragOver ? <DragOverDecoration/> : <IdleDecoration/>}

                <div className={cls.CenterContent}>
                    <DropZoneIcon dragOver={dragOver}/>
                    <div className={cls.TextContent}>
                        <DropZoneText dragOver={dragOver}/>
                    </div>
                </div>

                {!dragOver && <span className={cls.BottomHint}>mp3</span>}
            </div>
        </div>
    );
}
