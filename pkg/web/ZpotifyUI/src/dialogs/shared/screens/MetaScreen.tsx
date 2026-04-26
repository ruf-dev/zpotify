import {useCallback, useEffect, useState} from 'react';
import cls from '@/dialogs/shared/screens/MetaScreen.module.css';
import MusicFileIcon from '@/assets/icons/MusicFileIcon.tsx';

import MultiSelect, {Option} from '@/components/shared/MultiSelect.tsx';
import {IFileService} from '@/processes/FileService.ts';
import {IArtistsService} from '@/processes/ArtistsService.ts';
import {FileInfo} from '@/app/api/zpotify';
import {formatFileDuration, formatFileBytes} from '@/utils/files.ts';
import {formatDuration} from '@/utils/time.ts';

interface MetaScreenProps {
    file?: File | null;
    fileId?: string;
    durationSec?: number;
    fileService: IFileService;
    artistsService: IArtistsService;
    title: string;
    onTitleChange: (title: string) => void;
    selectedArtists: string[];
    onArtistsChange: (artists: string[]) => void;
    playlistId: string;
    onPlaylistChange: (id: string) => void;
}

export default function MetaScreen({
    file = null, fileId, durationSec, fileService, artistsService,
    title, onTitleChange,
    selectedArtists, onArtistsChange,
    playlistId, onPlaylistChange,
}: MetaScreenProps) {
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [playlistOptions, setPlaylistOptions] = useState<Option[]>([]);

    useEffect(() => {
        if (!fileId) return;
        fileService.GetFile({fileId}).then((res) => {
            if (res.file) setFileInfo(res.file);
        });
    }, [fileId]);

    const listArtists = useCallback(
        (query: string): Promise<Option[]> =>
            artistsService.ListArtist(query, 0, 100)
                .then(res => (res.artists ?? [])
                    .filter(a => a.name && a.uuid)
                    .map(a => ({id: a.uuid!, label: a.name!}))),
        [artistsService]
    );

    const createArtist = useCallback(
        async (name: string): Promise<Option> => ({id: name, label: name}),
        []
    );

    const listPlaylists = useCallback(
        (query: string): Promise<Option[]> => {
            const q = query.toLowerCase();
            return Promise.resolve(
                q ? playlistOptions.filter(o => o.label.toLowerCase().includes(q)) : playlistOptions
            );
        },
        [playlistOptions]
    );

    const addPlaylist = useCallback(
        async (name: string): Promise<Option> => {
            const opt: Option = {id: `temp-${Date.now()}`, label: name};
            setPlaylistOptions(prev => [...prev, opt]);
            return opt;
        },
        []
    );

    const displayDuration = fileInfo
        ? formatFileDuration(fileInfo.durationSec)
        : durationSec != null
        ? formatDuration(Math.round(durationSec))
        : '—';

    return (
        <div className={cls.MetaScreenContainer}>
            <div className={cls.FileInfoRow}>
                <MusicFileIcon className={cls.FileIcon}/>
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
                <MultiSelect
                    placeholder="pick artist(s)…"
                    selectedIds={selectedArtists}
                    onChange={onArtistsChange}
                    doList={listArtists}
                    onAdd={createArtist}
                />
            </div>

            <div className={cls.TwoColGrid}>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>duration</label>
                    <div className={cls.ReadOnlyTile}>{displayDuration}</div>
                </div>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>file size</label>
                    <div className={cls.ReadOnlyTile}>{formatFileBytes(fileInfo?.sizeBytes, file?.size ?? 0)}</div>
                </div>
            </div>

            <div className={cls.Field}>
                <label className={cls.FieldLabel}>add to playlist <span className={cls.FieldLabelOptional}>(optional)</span></label>
                <MultiSelect
                    isMultiselect={false}
                    placeholder="pick a playlist…"
                    selectedIds={playlistId ? [playlistId] : []}
                    onChange={ids => onPlaylistChange(ids[0] ?? '')}
                    doList={listPlaylists}
                    onAdd={addPlaylist}
                />
            </div>
        </div>
    );
}
