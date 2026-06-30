import CoverField from '@/components/CoverField/CoverField';
import ArtistChipsField from '@/widgets/ArtistField/ArtistChipsField';
import DisabledChip from '@/shared/ui/DisabledChip';
import ChipsField from '@/widgets/ChipsField/ChipsField';
import type { ArtistItem } from '@/widgets/ArtistField/ArtistChipsField';
import type { ChipEntry } from '@/widgets/ChipsField/ChipsField';
import { formatDuration } from '@/shared/lib/time';

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

function ClockIcon() {
    return (
        <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="5.5" cy="5.5" r="4.5" />
            <path d="M5.5 3v2.5l1.5 1.5" />
        </svg>
    );
}

function DiscIcon() {
    return (
        <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        >
            <circle cx="5.5" cy="5.5" r="4.5" />
            <circle cx="5.5" cy="5.5" r="1.5" />
        </svg>
    );
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
    function handleYearChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        onYearChange(val === '' ? undefined : parseInt(val, 10));
    }

    return (
        <div className={cls.PlaylistDetailsPanelContainer}>
            <CoverField cover={cover} onChange={onCoverChange} existingCoverUrl={existingCoverUrl} />

            <div className={cls.FieldsStack}>
                <div className={cls.FieldGroup}>
                    <div className={cls.FieldLabelRow}>
                        <span className={cls.FieldLabel}>
                            name <span className={cls.Required}>*</span>
                        </span>
                    </div>
                    <input
                        className={cls.NameInput}
                        type="text"
                        value={playlistName}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="untitled playlist"
                    />
                </div>

                <div className={cls.FieldGroup}>
                    <div className={cls.FieldLabelRow}>
                        <span className={cls.FieldLabel}>year</span>
                    </div>
                    <input
                        className={cls.NameInput}
                        type="number"
                        value={year ?? ''}
                        onChange={handleYearChange}
                        placeholder="e.g. 2024"
                        min={1900}
                        max={2100}
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
                        <DisabledChip icon={<ClockIcon />} label="total" value={formatTotalDuration(totalDurationSec)} />
                        <DisabledChip icon={<DiscIcon />} label="tracks" value={String(trackCount)} />
                    </div>
                )}
            </div>
        </div>
    );
}
