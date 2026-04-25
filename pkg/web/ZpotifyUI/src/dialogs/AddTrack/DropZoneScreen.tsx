import {useRef, useState} from 'react';
import cls from '@/dialogs/AddTrack/DropZoneScreen.module.css';

interface DropZoneScreenProps {
    onFile: (file: File) => void;
}

export default function DropZoneScreen({onFile}: DropZoneScreenProps) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) onFile(f);
    };

    return (
        <div className={cls.DropZoneScreenContainer}>
            <div
                className={`${cls.DropZone} ${dragOver ? cls.DropZoneDragOver : ''}`}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={() => setDragOver(false)}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="audio/*"
                    className={cls.HiddenInput}
                    onChange={handleInputChange}
                />

                {!dragOver && (
                    <>
                        <svg className={cls.Ring1} width="176" height="176" viewBox="0 0 176 176" fill="none">
                            <circle cx="88" cy="88" r="82" stroke="currentColor" strokeWidth="1.5" strokeDasharray="10 8" strokeLinecap="round"/>
                        </svg>
                        <svg className={cls.Ring2} width="128" height="128" viewBox="0 0 128 128" fill="none">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="1" strokeDasharray="4 14" strokeLinecap="round"/>
                        </svg>
                    </>
                )}

                {dragOver && (
                    <>
                        <div className={cls.DragBorder}/>
                        <div className={cls.RadarPulse}/>
                        <div className={`${cls.RadarPulse} ${cls.RadarPulse2}`}/>
                        <div className={`${cls.RadarPulse} ${cls.RadarPulse3}`}/>
                    </>
                )}

                <div className={cls.CenterContent}>
                    {dragOver ? (
                        <svg className={cls.IconDragOver} width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="22" cy="22" r="18"/>
                            <path d="M22 14v14M15 27l7 7 7-7"/>
                        </svg>
                    ) : (
                        <svg className={cls.IconIdle} width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 32V18M15 25l7-7 7 7"/>
                            <path d="M10 36h24"/>
                        </svg>
                    )}

                    <div className={cls.TextContent}>
                        {dragOver ? (
                            <span className={cls.TextDragOver}>release to upload</span>
                        ) : (
                            <>
                                <span className={cls.TextIdle}>drop your track here</span>
                                <span className={cls.TextSub}>or <u>click to browse</u></span>
                            </>
                        )}
                    </div>
                </div>

                {!dragOver && (
                    <span className={cls.BottomHint}>mp3</span>
                )}
            </div>
        </div>
    );
}
