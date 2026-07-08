import { Input } from '@vervstack/chures';

import CoverField from '@/components/CoverField/CoverField';
import ArtistChipsField from '@/widgets/ArtistField/ArtistChipsField';
import DisabledChip from '@/shared/ui/DisabledChip';
import ChipsField from '@/widgets/ChipsField/ChipsField';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { ChipEntry } from '@/widgets/ChipsField/ChipsField';
import { formatDuration } from '@/shared/lib/time';
import { MiniClockIcon } from '@/assets/icons/MiniClockIcon';
import { MiniDiscIcon } from '@/assets/icons/MiniDiscIcon';
import cls from '@/dialogs/MultitrackUpload/PlaylistDetailsPanel.module.css';

interface PlaylistDetailsPanelProps {
    cover?: File;
    onCoverChange: (file: File) => void;
    existingCoverUrl?: string;
    playlistName: string;
    onNameChange: (name: string) => void;
    albumArtists: ArtistItem[];
    onAlbumArtistsChange: (artists: ArtistItem[]) => void;
    totalDurationSec?: number;
    trackCount?: number;
    year?: number;
    onYearChange: (year: number | undefined) => void;
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
    chips: ChipEntry[];
    onChipsChange: (chips: ChipEntry[]) => void;
}

function formatTotalDuration(secs: number): string {
    if (secs === 0) return '0:00';
    return formatDuration(Math.round(secs));
}

export default function PlaylistDetailsPanel({
    cover,
    onCoverChange,
    existingCoverUrl,
    playlistName,
    onNameChange,
    albumArtists,
    onAlbumArtistsChange,
    totalDurationSec,
    trackCount,
    year,
    onYearChange,
    loadArtistOptions,
    onCreateArtist,
    chips,
    onChipsChange,
}: PlaylistDetailsPanelProps) {
    function handleYearChange(val: string) {
        onYearChange(val === '' ? undefined : parseInt(val, 10));
    }

    return (
        <div className={cls.PlaylistDetailsPanelContainer}>
            <CoverField cover={cover} onChange={onCoverChange} existingCoverUrl={existingCoverUrl} />

            <div className={cls.FieldsStack}>
                <div className={cls.FieldGroup}>
                    <Input value={playlistName} setValue={onNameChange} label="name *" />
                </div>

                <div className={cls.FieldGroup}>
                    <Input
                        value={year !== undefined ? String(year) : ''}
                        setValue={handleYearChange}
                        label="year"
                        type="number"
                    />
                </div>

                <div className={cls.FieldGroup}>
                    <div className={cls.FieldLabelRow}>
                        <span className={cls.FieldLabel}>album artists</span>
                        <span className={cls.FieldHint}>appear on every track</span>
                    </div>
                    <ArtistChipsField
                        artists={albumArtists}
                        onChange={onAlbumArtistsChange}
                        placeholder="add album artist…"
                        loadOptions={loadArtistOptions}
                        onCreateArtist={onCreateArtist}
                    />
                </div>

                <div className={cls.FieldGroup}>
                    <div className={cls.FieldLabelRow}>
                        <span className={cls.FieldLabel}>tags</span>
                        <span className={cls.FieldHint}>genre, mood, era…</span>
                    </div>
                    <ChipsField chips={chips} onChange={onChipsChange} />
                </div>

                {totalDurationSec !== undefined && trackCount !== undefined && (
                    <div className={cls.MetaChipsRow}>
                        <DisabledChip
                            icon={<MiniClockIcon />}
                            label="total"
                            value={formatTotalDuration(totalDurationSec)}
                        />
                        <DisabledChip icon={<MiniDiscIcon />} label="tracks" value={String(trackCount)} />
                    </div>
                )}
            </div>
        </div>
    );
}
