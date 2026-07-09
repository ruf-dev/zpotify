import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import cn from 'classnames';

import cls from '@/dialogs/AddTrack/screens/DropZoneScreen.module.css';
import { AddTrackContext } from '@/dialogs/AddTrack/AddTrackDialog';
import { AUDIO_ACCEPT, isSupportedAudioFile } from '@/features/upload/supportedAudio.ts';
import IdleDecoration from '@/dialogs/AddTrack/screens/components/IdleDecoration/IdleDecoration';
import DragOverDecoration from '@/dialogs/AddTrack/screens/components/DragOverDecoration/DragOverDecoration';
import DropZoneIcon from '@/dialogs/AddTrack/screens/components/DropZoneIcon/DropZoneIcon';
import DropZoneText from '@/dialogs/AddTrack/screens/components/DropZoneText/DropZoneText';
import UploadingSpinner from '@/dialogs/AddTrack/screens/components/UploadingSpinner/UploadingSpinner';

export default function DropZoneScreen({ handleFiles, uploadError, uploading }: AddTrackContext) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    if (uploading) {
        return <UploadingSpinner />;
    }

    function handleDrop(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(isSupportedAudioFile);
        if (files.length > 0) handleFiles(files);
    }

    function handleDragOver(e: DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragOver(true);
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) handleFiles(files);
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
                className={cn(cls.DropZone, dragOver && cls.DropZoneDragOver)}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={AUDIO_ACCEPT}
                    multiple
                    className={cls.HiddenInput}
                    onChange={handleInputChange}
                />

                {dragOver ? <DragOverDecoration /> : <IdleDecoration />}

                <div className={cls.CenterContent}>
                    <DropZoneIcon dragOver={dragOver} />
                    <DropZoneText dragOver={dragOver} />
                </div>

                {!dragOver && <span className={cls.BottomHint}>mp3 · flac · aac</span>}
            </div>

            {uploadError && <span className={cls.UploadError}>{uploadError}</span>}
        </div>
    );
}
