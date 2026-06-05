import cls from './PlaylistDetailsPanel.module.css';
import CoverField from '@/components/CoverField/CoverField';
import ArtistChipsField from '@/components/ArtistChipsField/ArtistChipsField';
import DisabledChip from '@/components/DisabledChip/DisabledChip';
import type {ArtistItem} from '@/components/ArtistChipsField/ArtistChipsField';
import {formatDuration} from '@/shared/lib/time';

interface PlaylistDetailsPanelProps {
    cover?: File;
    onCoverChange: (file: File) => void;
    playlistName: string;
    onNameChange: (name: string) => void;
    albumArtists: ArtistItem[];
    onAlbumArtistsChange: (artists: ArtistItem[]) => void;
    totalDurationSec: number;
    trackCount: number;
    loadArtistOptions: (query: string) => Promise<ArtistItem[]>;
    onCreateArtist: (name: string) => Promise<ArtistItem>;
}

function ClockIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5.5" cy="5.5" r="4.5"/>
            <path d="M5.5 3v2.5l1.5 1.5"/>
        </svg>
    );
}

function DiscIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="5.5" cy="5.5" r="4.5"/>
            <circle cx="5.5" cy="5.5" r="1.5"/>
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
    playlistName,
    onNameChange,
    albumArtists,
    onAlbumArtistsChange,
    totalDurationSec,
    trackCount,
    loadArtistOptions,
    onCreateArtist,
}: PlaylistDetailsPanelProps) {
    return (
        <div className={cls.PlaylistDetailsPanelContainer}>
            <CoverField cover={cover} onChange={onCoverChange}/>

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
                        onChange={e => onNameChange(e.target.value)}
                        placeholder="untitled playlist"
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

                <div className={cls.MetaChipsRow}>
                    <DisabledChip
                        icon={<ClockIcon/>}
                        label="total"
                        value={formatTotalDuration(totalDurationSec)}
                    />
                    <DisabledChip
                        icon={<DiscIcon/>}
                        label="tracks"
                        value={String(trackCount)}
                    />
                </div>
            </div>
        </div>
    );
}
