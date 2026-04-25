import {useEffect, useState} from 'react';
import ArtistMultiSelect from '@/dialogs/AddTrack/ArtistMultiSelect';
import cls from '@/dialogs/AddTrack/MetaScreen.module.css';
import {IFileService} from '@/processes/FileService.ts';
import {FileInfo} from '@/app/api/zpotify';
import {formatFileDuration, formatFileBytes} from '@/utils/files.ts';

interface Playlist {
    id: string;
    name: string;
    count: number;
}

interface MetaScreenProps {
    file: File;
    fileId: string;
    fileService: IFileService;
    title: string;
    onTitleChange: (title: string) => void;
    selectedArtists: string[];
    onArtistsChange: (artists: string[]) => void;
    artistOptions: string[];
    playlistId: string;
    onPlaylistChange: (id: string) => void;
    playlists: Playlist[];
    submitted: boolean;
    onSubmit: () => void;
}

export default function MetaScreen({
    file, fileId, fileService,
    title, onTitleChange,
    selectedArtists, onArtistsChange, artistOptions,
    playlistId, onPlaylistChange, playlists,
    submitted, onSubmit,
}: MetaScreenProps) {
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);

    useEffect(() => {
        fileService.GetFile({fileId}).then((res) => {
            if (res.file) setFileInfo(res.file);
        });
    }, [fileId]);

    const ready = Boolean(playlistId) && !submitted;

    const buttonClass = submitted
        ? cls.ButtonSubmitted
        : ready
        ? cls.ButtonReady
        : cls.ButtonDisabled;

    return (
        <div className={cls.MetaScreenContainer}>
            <div className={cls.FileInfoRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls.FileIcon}>
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>
                <span className={cls.FileName}>{file.name}</span>
                <span className={cls.SizePill}>{formatFileBytes(fileInfo?.sizeBytes, file.size)}</span>
            </div>

            <div className={cls.Field}>
                <label className={cls.FieldLabel}>title</label>
                <input
                    className={cls.FieldInput}
                    type="text"
                    value={title}
                    onChange={e => onTitleChange(e.target.value)}
                />
            </div>

            <div className={cls.Field}>
                <label className={cls.FieldLabel}>artist(s)</label>
                <ArtistMultiSelect
                    options={artistOptions}
                    selected={selectedArtists}
                    onChange={onArtistsChange}
                />
            </div>

            <div className={cls.TwoColGrid}>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>duration</label>
                    <div className={cls.ReadOnlyTile}>{formatFileDuration(fileInfo?.durationSec)}</div>
                </div>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>file size</label>
                    <div className={cls.ReadOnlyTile}>{formatFileBytes(fileInfo?.sizeBytes, file.size)}</div>
                </div>
            </div>

            <div className={cls.Field}>
                <label className={cls.FieldLabel}>add to playlist</label>
                <select
                    className={`${cls.Select} ${playlistId ? cls.SelectFilled : ''}`}
                    value={playlistId}
                    onChange={e => onPlaylistChange(e.target.value)}
                >
                    <option value="">pick a playlist…</option>
                    {playlists.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            <button
                className={`${cls.SubmitButton} ${buttonClass}`}
                type="button"
                onClick={onSubmit}
                disabled={!ready}
            >
                {submitted ? '✓ added to playlist' : 'add to playlist'}
            </button>
        </div>
    );
}
