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
import FieldLabelRow from '@/dialogs/MultitrackUpload/components/FieldLabelRow/FieldLabelRow';
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

export default function PlaylistDetailsPanel(props: PlaylistDetailsPanelProps) {
    function handleYearChange(val: string) {
        props.onYearChange(val === '' ? undefined : parseInt(val, 10));
    }

    return (
        <div className={cls.PlaylistDetailsPanelContainer}>
            <CoverField cover={props.cover} onChange={props.onCoverChange} existingCoverUrl={props.existingCoverUrl} />

            <div className={cls.FieldsStack}>
                <div className={cls.FieldGroup}>
                    <Input value={props.playlistName} setValue={props.onNameChange} label="name *" />
                </div>

                <div className={cls.FieldGroup}>
                    <Input
                        value={props.year !== undefined ? String(props.year) : ''}
                        setValue={handleYearChange}
                        label="year"
                        type="number"
                    />
                </div>

                <div className={cls.FieldGroup}>
                    <FieldLabelRow label="album artists" hint="appear on every track" />
                    <ArtistChipsField
                        artists={props.albumArtists}
                        onChange={props.onAlbumArtistsChange}
                        placeholder="add album artist…"
                        loadOptions={props.loadArtistOptions}
                        onCreateArtist={props.onCreateArtist}
                    />
                </div>

                <div className={cls.FieldGroup}>
                    <FieldLabelRow label="tags" hint="genre, mood, era…" />
                    <ChipsField chips={props.chips} onChange={props.onChipsChange} />
                </div>

                {props.totalDurationSec !== undefined && props.trackCount !== undefined && (
                    <div className={cls.MetaChipsRow}>
                        <DisabledChip
                            icon={<MiniClockIcon />}
                            label="total"
                            value={formatTotalDuration(props.totalDurationSec)}
                        />
                        <DisabledChip icon={<MiniDiscIcon />} label="tracks" value={String(props.trackCount)} />
                    </div>
                )}
            </div>
        </div>
    );
}
