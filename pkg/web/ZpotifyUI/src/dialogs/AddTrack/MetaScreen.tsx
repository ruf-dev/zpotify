import {useEffect, useState} from 'react';
import ArtistMultiSelect from '@/dialogs/AddTrack/ArtistMultiSelect';
import PlaylistSelect, {PlaylistOption} from '@/dialogs/AddTrack/PlaylistSelect';
import cls from '@/dialogs/AddTrack/MetaScreen.module.css';
import {IFileService} from '@/processes/FileService.ts';
import {IArtistsService} from '@/processes/ArtistsService.ts';
import {FileInfo} from '@/app/api/zpotify';
import {formatFileDuration, formatFileBytes} from '@/utils/files.ts';

interface MetaScreenProps {
    file?: File | null;
    fileId: string;
    fileService: IFileService;
    artistsService: IArtistsService;
    title: string;
    onTitleChange: (title: string) => void;
    selectedArtists: string[];
    onArtistsChange: (artists: string[]) => void;
    playlistId: string;
    onPlaylistChange: (id: string) => void;
    submitted: boolean;
    onSubmit: () => void;
}

export default function MetaScreen({
    file = null, fileId, fileService, artistsService,
    title, onTitleChange,
    selectedArtists, onArtistsChange,
    playlistId, onPlaylistChange,
    submitted, onSubmit,
}: MetaScreenProps) {
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [artistOptions, setArtistOptions] = useState<string[]>([]);
    const [playlistOptions, setPlaylistOptions] = useState<PlaylistOption[]>([]);

    useEffect(() => {
        fileService.GetFile({fileId}).then((res) => {
            if (res.file) setFileInfo(res.file);
        });
    }, [fileId]);

    useEffect(() => {
        artistsService.ListArtist('', 0, 100)
            .then(res => setArtistOptions(
                (res.artists || []).map(a => a.name ?? '').filter(Boolean)
            ));
    }, []);

    const handleCreateArtist = (name: string) => {
        setArtistOptions(prev => [...prev, name]);
    };

    const handleCreatePlaylist = (name: string) => {
        const tempId = `temp-${Date.now()}`;
        setPlaylistOptions(prev => [...prev, {id: tempId, name}]);
        onPlaylistChange(tempId);
    };

    const ready = !submitted;

    const buttonClass = submitted
        ? cls.ButtonSubmitted
        : cls.ButtonReady;

    return (
        <div className={cls.MetaScreenContainer}>
            <div className={cls.FileInfoRow}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cls.FileIcon}>
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                </svg>
                <span className={cls.FileName}>{file?.name ?? fileInfo?.path?.split('/').pop() ?? 'uploaded file'}</span>
                <span className={cls.SizePill}>{formatFileBytes(fileInfo?.sizeBytes, file?.size ?? 0)}</span>
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
                    onCreateArtist={handleCreateArtist}
                />
            </div>

            <div className={cls.TwoColGrid}>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>duration</label>
                    <div className={cls.ReadOnlyTile}>{formatFileDuration(fileInfo?.durationSec)}</div>
                </div>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>file size</label>
                    <div className={cls.ReadOnlyTile}>{formatFileBytes(fileInfo?.sizeBytes, file?.size ?? 0)}</div>
                </div>
            </div>

            <div className={cls.Field}>
                <label className={cls.FieldLabel}>add to playlist <span className={cls.FieldLabelOptional}>(optional)</span></label>
                <PlaylistSelect
                    options={playlistOptions}
                    value={playlistId}
                    onChange={onPlaylistChange}
                    onCreatePlaylist={handleCreatePlaylist}
                />
            </div>

            <button
                className={`${cls.SubmitButton} ${buttonClass}`}
                type="button"
                onClick={onSubmit}
                disabled={!ready}
            >
                {submitted ? '✓ added' : 'add track'}
            </button>
        </div>
    );
}