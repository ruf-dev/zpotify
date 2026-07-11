import { useCallback, useEffect, useState } from 'react';
import { Input } from '@vervstack/chures';

import cls from '@/dialogs/shared/screens/MetaScreen.module.css';
import MusicFileIcon from '@/assets/icons/MusicFileIcon.tsx';
import MultiSelect, { Option } from '@/shared/ui/MultiSelect.tsx';
import type { FileInfo } from '@/app/api/zpotify';
import { formatFileDuration, formatFileBytes } from '@/shared/lib/files.ts';
import { formatDuration } from '@/shared/lib/time.ts';
import { AudioFile } from '@/shared/model/AudioFile.ts';
import { fileService } from '@/shared/api/FileService.ts';
import { artistsService } from '@/shared/api/ArtistsService.ts';

interface MetaScreenProps {
    audioFile?: AudioFile;
    title: string;
    onTitleChange: (title: string) => void;
    selectedArtists: string[];
    onArtistsChange: (artists: string[]) => void;
    playlistId: string;
    onPlaylistChange: (id: string) => void;
    initialArtistOptions?: Option[];
}

export default function MetaScreen(props: MetaScreenProps) {
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
    const [playlistOptions, setPlaylistOptions] = useState<Option[]>([]);

    useEffect(() => {
        if (!props.audioFile?.fileId) return;

        fileService.GetFile({ fileId: props.audioFile.fileId }).then((res) => {
            if (res.file) setFileInfo(res.file);
        });
    }, [props.audioFile?.fileId]);

    const listArtists = useCallback(
        (query: string): Promise<Option[]> =>
            artistsService
                .ListArtist(query, 0, 100)
                .then((res) =>
                    (res.artists ?? []).filter((a) => a.name && a.uuid).map((a) => ({ id: a.uuid!, label: a.name! })),
                ),
        [],
    );

    const createArtist = useCallback(
        (name: string): Promise<Option> =>
            artistsService.CreateArtist(name).then((artist) => ({ id: artist.id, label: artist.name })),
        [],
    );

    const listPlaylists = useCallback(
        (query: string): Promise<Option[]> => {
            const q = query.toLowerCase();
            return Promise.resolve(
                q ? playlistOptions.filter((o) => o.label.toLowerCase().includes(q)) : playlistOptions,
            );
        },
        [playlistOptions],
    );

    const addPlaylist = useCallback((name: string): Promise<Option> => {
        const opt: Option = { id: `temp-${Date.now()}`, label: name };
        setPlaylistOptions((prev) => [...prev, opt]);
        return Promise.resolve(opt);
    }, []);

    const displayDuration = fileInfo
        ? formatFileDuration(fileInfo.durationSec)
        : props.audioFile?.durationSec != null
          ? formatDuration(Math.round(props.audioFile.durationSec))
          : '—';

    return (
        <div className={cls.MetaScreenContainer}>
            <div className={cls.FileInfoRow}>
                <MusicFileIcon className={cls.FileIcon} />
                <span className={cls.FileName}>{fileInfo?.path?.split('/').pop() ?? 'uploaded file'}</span>
            </div>

            <div className={cls.Field}>
                <Input value={props.title} setValue={props.onTitleChange} label="title" />
            </div>

            <div className={cls.Field}>
                <label className={cls.FieldLabel}>artist(s)</label>
                <MultiSelect
                    placeholder="pick artist(s)…"
                    selectedIds={props.selectedArtists}
                    onChange={props.onArtistsChange}
                    doList={listArtists}
                    onAdd={createArtist}
                    initialOptions={props.initialArtistOptions}
                />
            </div>

            <div className={cls.TwoColGrid}>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>duration</label>
                    <div className={cls.ReadOnlyTile}>{displayDuration}</div>
                </div>
                <div className={cls.Field}>
                    <label className={cls.FieldLabel}>file size</label>
                    <div className={cls.ReadOnlyTile}>{formatFileBytes(fileInfo?.sizeBytes, 0)}</div>
                </div>
            </div>

            <div className={cls.Field}>
                <label className={cls.FieldLabel}>
                    add to playlist <span className={cls.FieldLabelOptional}>(optional)</span>
                </label>
                <MultiSelect
                    isMultiselect={false}
                    placeholder="pick a playlist…"
                    selectedIds={props.playlistId ? [props.playlistId] : []}
                    onChange={(ids) => props.onPlaylistChange(ids[0] ?? '')}
                    doList={listPlaylists}
                    onAdd={addPlaylist}
                />
            </div>
        </div>
    );
}
