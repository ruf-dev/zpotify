import { useState } from 'react';
import cn from 'classnames';

import cls from '@/pages/main/album/components/AlbumSidebar/AlbumSidebar.module.css';
import type { Playlist } from '@/app/api/zpotify';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';
import BackButton from '@/shared/ui/BackButton.tsx';
import RandomArrows from '@/assets/player/ShuffleArrows.tsx';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';
import { ShareIcon } from '@/assets/icons/ShareIcon.tsx';

// TODO: implement album metadata endpoint (GetAlbum) — album entity not yet in backend
const MOCK_GENRES = ['Electronic', 'Ambient', 'Experimental'];
const MOCK_YEAR = 2024;
const MOCK_CREDITS = [
    { role: 'Producer', name: 'Lena Kovacs' },
    { role: 'Mastering', name: 'Studio Ariel' },
    { role: 'Artwork', name: 'M. Frost' },
];
const MOCK_LABEL = 'Zpotify Records';

function resolveCoverSeed(playlist: Playlist): number {
    const fileId = playlist.coverFilePath ?? '';
    const match = fileId.match(/^generative:(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    const uuid = playlist.uuid ?? '0';
    return (uuid.charCodeAt(0) % 7) + 1;
}

function buildCoverUrl(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    const base = (import.meta.env.VITE_ZPOTIFY_WEBSERVER as string | undefined) ?? '';
    return `${base}/${filePath}`;
}

export interface AlbumSidebarProps {
    playlist: Playlist | null;
    totalDuration: string;
    saved: boolean;
    onToggleSave: () => void;
    onBack: () => void;
    onPlay: () => void;
}

export default function AlbumSidebar({ playlist, totalDuration, saved, onToggleSave, onBack, onPlay }: AlbumSidebarProps) {
    const seed = playlist ? resolveCoverSeed(playlist) : 1;
    const coverUrl = buildCoverUrl(playlist?.coverFilePath);
    const artistName = playlist?.artists?.[0]?.name ?? 'Unknown Artist';
    const [aboutExpanded, setAboutExpanded] = useState(false);

    function handleToggleAbout() {
        setAboutExpanded((prev) => !prev);
    }

    if (!playlist) {
        return (
            <div className={cls.SidebarContainer}>
                <BackButton onClick={onBack} />
                <div className={cls.ErrorState}>
                    <span className={cls.ErrorIcon}>!</span>
                    <p className={cls.ErrorTitle}>Album not found</p>
                    <p className={cls.ErrorHint}>This album may have been removed or is unavailable.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cls.SidebarContainer}>
            <BackButton onClick={onBack} />

            <div className={cls.CoverWrapper}>
                {coverUrl ? (
                    <img src={coverUrl} alt={playlist.name} className={cls.CoverImage} />
                ) : (
                    <GenerativeCover seed={seed} size={220} borderRadius="0" />
                )}
            </div>

            <div className={cls.TitleBlock}>
                <span className={cls.TypeLabel}>album</span>
                <h1 className={cls.AlbumName}>{playlist.name}</h1>
                <span className={cls.ArtistName}>{artistName}</span>
                <div className={cls.MetaRow}>
                    {/* TODO: implement album metadata endpoint (GetAlbum) — album entity not yet in backend */}
                    <span>{MOCK_YEAR}</span>
                    <span>·</span>
                    <span>{playlist.songCount ?? 0} tracks</span>
                    <span>·</span>
                    <span>{totalDuration}</span>
                </div>
            </div>

            <div className={cls.GenreChipsRow}>
                {/* TODO: implement album metadata endpoint (GetAlbum) — album entity not yet in backend */}
                {MOCK_GENRES.map((genre) => (
                    <span key={genre} className={cls.GenreChip}>
                        {genre}
                    </span>
                ))}
            </div>

            <div className={cls.ActionRow}>
                <button className={cls.PlayButton} type="button" aria-label="Play album" onClick={onPlay}>
                    <PlayIcon className={cls.PlayIcon} />
                </button>
                <button className={cls.IconButton} type="button" aria-label="Shuffle">
                    <RandomArrows />
                </button>
                <button
                    className={cn(cls.IconButton, saved && cls.IconButtonActive)}
                    type="button"
                    aria-label={saved ? 'Remove from library' : 'Save to library'}
                    onClick={onToggleSave}
                >
                    <HeartIcon filled={saved} />
                </button>
                <button className={cls.IconButton} type="button" aria-label="Share">
                    <ShareIcon />
                </button>
            </div>

            {playlist.description && (
                <div className={cls.AboutSection}>
                    <span className={cls.SectionLabel}>about</span>
                    <p className={cn(cls.AboutBody, !aboutExpanded && cls.AboutBodyClamped)}>{playlist.description}</p>
                    <button className={cls.ReadMoreToggle} type="button" onClick={handleToggleAbout}>
                        {aboutExpanded ? 'show less' : 'read more'}
                    </button>
                </div>
            )}

            <div>
                <span className={cls.SectionLabel}>credits</span>
                {/* TODO: implement album metadata endpoint (GetAlbum) — album entity not yet in backend */}
                <div className={cls.CreditsSection}>
                    {MOCK_CREDITS.map((credit) => (
                        <div key={credit.role} className={cls.CreditEntry}>
                            <span className={cls.CreditRole}>{credit.role}</span>
                            <span className={cls.CreditName}>{credit.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cls.LabelPill}>
                {/* TODO: implement album metadata endpoint (GetAlbum) — album entity not yet in backend */}
                <span className={cls.LabelPillLabel}>label</span>
                <span className={cls.LabelPillName}>{MOCK_LABEL}</span>
            </div>
        </div>
    );
}
