import { useRef, type ChangeEvent } from 'react';

import { DownloadIcon } from '@/assets/icons/DownloadIcon';
import cls from '@/dialogs/AddTrack/screens/components/TorrentCard/TorrentCard.module.css';
import { TORRENT_EXTENSION } from '@/features/upload/torrentFile.ts';

interface TorrentCardProps {
    onFile: (file: File) => void;
}

export default function TorrentCard({ onFile }: TorrentCardProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    function handleClick() {
        inputRef.current?.click();
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            onFile(file);
        }
        e.target.value = '';
    }

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept={TORRENT_EXTENSION}
                className={cls.HiddenInput}
                onChange={handleInputChange}
            />
            <div className={cls.TorrentCardContainer} onClick={handleClick}>
                <div className={cls.IconCircleAccent}>
                    <DownloadIcon />
                </div>
                <span className={cls.CardTitle}>add torrent</span>
                <span className={cls.CardSubtitle}>upload a .torrent file to add tracks</span>
            </div>
        </>
    );
}
