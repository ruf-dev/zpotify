import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cn from 'classnames';

import cls from '@/pages/main/album/AlbumPage.module.css';
import type { Playlist, SongBase } from '@/app/api/zpotify';

import useUser from '@/entities/user/useUser.ts';
import { Path } from '@/app/routing/paths.ts';
import { usePlaylist } from '@/pages/main/playlist/usePlaylist.ts';
import { useAlbumSongs } from '@/pages/main/album/useAlbumSongs.ts';
import useAudioPlayer from '@/widgets/MusicPlayer/usePlayer.ts';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';
import BackButton from '@/shared/ui/BackButton.tsx';
import RandomArrows from '@/assets/player/ShuffleArrows.tsx';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';
import NowPlayingBars from '@/assets/icons/NowPlayingBars.tsx';

/* ── Mock data (replace when album entity is added to backend) ── */

interface MockComment {
    id: number;
    user: string;
    avatar: string;
    time: string;
    text: string;
    likes: number;
}

// TODO: implement album metadata endpoint (GetAlbum) — album entity not yet in backend
const MOCK_GENRES = ['Electronic', 'Ambient', 'Experimental'];
const MOCK_YEAR = 2024;
const MOCK_CREDITS = [
    { role: 'Producer', name: 'Lena Kovacs' },
    { role: 'Mastering', name: 'Studio Ariel' },
    { role: 'Artwork', name: 'M. Frost' },
];
const MOCK_LABEL = 'Zpotify Records';

// TODO: implement comments API — no backend endpoint exists yet
const MOCK_COMMENTS: MockComment[] = [
    {
        id: 1,
        user: 'waverly',
        avatar: 'W',
        time: '2h ago',
        text: 'This album hits different at 2am. The production on Glass Shore is immaculate.',
        likes: 14,
    },
    {
        id: 2,
        user: 'neon.ghost',
        avatar: 'N',
        time: '5h ago',
        text: "Hollow Signal has been on repeat for a week. Can't get enough.",
        likes: 8,
    },
    {
        id: 3,
        user: 'serene_noise',
        avatar: 'S',
        time: '1d ago',
        text: "Finally an ambient record that doesn't put me to sleep. Every track is intentional.",
        likes: 22,
    },
];

/* ── Helpers ─────────────────────────────────────────────── */

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

function formatDuration(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function computeTotalDuration(songs: SongBase[]): string {
    const totalSec = songs.reduce((acc, s) => acc + (s.durationSec ?? 0), 0);
    const m = Math.floor(totalSec / 60);
    return `${m} min`;
}

/* ── Inline SVG icons ────────────────────────────────────── */

function HeartSvg({ filled }: { filled: boolean }) {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function ShareSvg() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
    );
}

function ClockSvg() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function PlayTriangleSvg() {
    return (
        <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
            <path d="M0 0L10 6L0 12V0Z" />
        </svg>
    );
}

/* ── AlbumSidebar ────────────────────────────────────────── */

interface AlbumSidebarProps {
    playlist: Playlist;
    totalDuration: string;
    saved: boolean;
    onToggleSave: () => void;
    onBack: () => void;
    onPlay: () => void;
}

function AlbumSidebar({ playlist, totalDuration, saved, onToggleSave, onBack, onPlay }: AlbumSidebarProps) {
    const seed = resolveCoverSeed(playlist);
    const coverUrl = buildCoverUrl(playlist.coverFilePath);
    const artistName = playlist.artists?.[0]?.name ?? 'Unknown Artist';
    const [aboutExpanded, setAboutExpanded] = useState(false);

    function handleToggleAbout() {
        setAboutExpanded((prev) => !prev);
    }

    return (
        <div className={cls.Sidebar}>
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
                    <HeartSvg filled={saved} />
                </button>
                <button className={cls.IconButton} type="button" aria-label="Share">
                    <ShareSvg />
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

/* ── AlbumTrackRow ───────────────────────────────────────── */

interface AlbumTrackRowProps {
    song: SongBase;
    index: number;
    isPlaying: boolean;
    isLiked: boolean;
    isHeartAnimating: boolean;
    onPlay: () => void;
    onToggleLike: () => void;
}

function AlbumTrackRow({
    song,
    index,
    isPlaying,
    isLiked,
    isHeartAnimating,
    onPlay,
    onToggleLike,
}: AlbumTrackRowProps) {
    function handleRowClick() {
        onPlay();
    }

    function handleHeartClick(e: React.MouseEvent) {
        e.stopPropagation();
        onToggleLike();
    }

    function handleOverflowClick(e: React.MouseEvent) {
        e.stopPropagation();
    }

    const artistName = song.artists?.[0]?.name ?? 'Unknown';
    const duration = formatDuration(song.durationSec ?? 0);

    return (
        <div className={cn(cls.TrackRow, isPlaying && cls.TrackRowPlaying)} onClick={handleRowClick} role="row">
            <div className={cls.TrackNumCell}>
                {isPlaying ? (
                    <NowPlayingBars />
                ) : (
                    <>
                        <span className={cls.TrackNum}>{index}</span>
                        <span className={cls.PlayTriangle}>
                            <PlayTriangleSvg />
                        </span>
                    </>
                )}
            </div>

            <div className={cls.TrackTitleCell}>
                <span className={cn(cls.TrackTitle, isPlaying && cls.TrackTitlePlaying)}>{song.title}</span>
                <span className={cls.TrackArtist}>{artistName}</span>
            </div>

            <button
                type="button"
                className={cn(cls.HeartIcon, isLiked && cls.HeartIconLiked, isHeartAnimating && cls.HeartPop)}
                onClick={handleHeartClick}
                aria-label={isLiked ? 'Unlike track' : 'Like track'}
            >
                <HeartSvg filled={isLiked} />
            </button>

            <span className={cls.TrackDuration}>{duration}</span>

            <button type="button" className={cls.OverflowBtn} onClick={handleOverflowClick} aria-label="More options">
                ···
            </button>
        </div>
    );
}

/* ── CommentsSection ─────────────────────────────────────── */

interface CommentsSectionProps {
    username: string;
}

function CommentsSection({ username }: CommentsSectionProps) {
    const [commentText, setCommentText] = useState('');
    const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(new Set());
    const [commentLikeCounts, setCommentLikeCounts] = useState<Record<number, number>>(
        Object.fromEntries(MOCK_COMMENTS.map((c) => [c.id, c.likes])),
    );

    function handleCommentTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setCommentText(e.target.value);
    }

    function handleSubmitComment() {
        if (!commentText.trim()) return;
        // TODO: implement comments API — no backend endpoint exists yet
        setCommentText('');
    }

    function handleToggleCommentLike(commentId: number) {
        setLikedCommentIds((prev) => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
                setCommentLikeCounts((counts) => ({ ...counts, [commentId]: (counts[commentId] ?? 0) - 1 }));
            } else {
                next.add(commentId);
                setCommentLikeCounts((counts) => ({ ...counts, [commentId]: (counts[commentId] ?? 0) + 1 }));
            }
            return next;
        });
    }

    return (
        <div className={cls.CommentsSection}>
            <div className={cls.CommentsHeader}>
                <span className={cls.SectionLabel}>comments</span>
                <span className={cls.CommentCountBadge}>{MOCK_COMMENTS.length}</span>
            </div>

            <div className={cls.CommentComposeRow}>
                <div className={cls.CommentAvatar}>{username[0]?.toUpperCase() ?? '?'}</div>
                <div className={cls.CommentTextareaWrapper}>
                    <textarea
                        className={cls.CommentTextarea}
                        rows={commentText ? 3 : 1}
                        placeholder="Add a comment…"
                        value={commentText}
                        onChange={handleCommentTextChange}
                    />
                    {commentText.length > 0 && (
                        <button
                            className={cls.CommentSubmit}
                            type="button"
                            onClick={handleSubmitComment}
                            disabled={!commentText.trim()}
                        >
                            Post
                        </button>
                    )}
                </div>
            </div>

            <div className={cls.CommentList}>
                {MOCK_COMMENTS.map((comment) => {
                    const isLiked = likedCommentIds.has(comment.id);
                    const likeCount = commentLikeCounts[comment.id] ?? comment.likes;

                    return (
                        <div key={comment.id} className={cls.CommentRow}>
                            <div className={cls.CommentAvatar}>{comment.avatar}</div>
                            <div className={cls.CommentContent}>
                                <div className={cls.CommentMeta}>
                                    <span className={cls.CommentUser}>{comment.user}</span>
                                    <span className={cls.CommentTime}>{comment.time}</span>
                                </div>
                                <p className={cls.CommentBody}>{comment.text}</p>
                                <div className={cls.CommentLikeRow}>
                                    <button
                                        type="button"
                                        className={cn(cls.CommentLikeBtn, isLiked && cls.CommentLikeBtnActive)}
                                        onClick={() => handleToggleCommentLike(comment.id)}
                                    >
                                        <HeartSvg filled={isLiked} />
                                        <span>{likeCount}</span>
                                    </button>
                                    <button type="button" className={cls.CommentReply}>
                                        reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── AlbumMainContent ────────────────────────────────────── */

interface AlbumMainContentProps {
    songs: SongBase[];
    currentTrackPath: string | null;
    onPlaySong: (song: SongBase) => void;
    username: string;
}

function AlbumMainContent({ songs, currentTrackPath, onPlaySong, username }: AlbumMainContentProps) {
    const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
    const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);

    function handleToggleLike(songId: string) {
        setLikedSongIds((prev) => {
            const next = new Set(prev);
            if (next.has(songId)) {
                next.delete(songId);
            } else {
                next.add(songId);
            }
            return next;
        });
        setAnimatingHeartId(songId);
        setTimeout(() => setAnimatingHeartId(null), 350);
    }

    return (
        <div className={cls.MainContent}>
            <div className={cls.TrackListHeader}>
                <span className={cls.ColNum}>#</span>
                <span className={cls.ColTitle}>title</span>
                <span />
                <span className={cls.ColDuration}>
                    <ClockSvg />
                </span>
                <span />
            </div>

            <div className={cls.TrackList}>
                {songs.map((song, i) => (
                    <AlbumTrackRow
                        key={song.id}
                        song={song}
                        index={i + 1}
                        isPlaying={currentTrackPath === song.id}
                        isLiked={likedSongIds.has(song.id ?? '')}
                        isHeartAnimating={animatingHeartId === song.id}
                        onPlay={() => onPlaySong(song)}
                        onToggleLike={() => handleToggleLike(song.id ?? '')}
                    />
                ))}
            </div>

            <CommentsSection username={username} />
        </div>
    );
}

/* ── AlbumPage ───────────────────────────────────────────── */

export default function AlbumPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userData = useUser((state) => state.userData);
    const auth = useUser((state) => state.auth);
    const { playlist } = usePlaylist(id);
    const { songs } = useAlbumSongs(id);
    const audioPlayer = useAudioPlayer();

    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!userData) {
            if (!auth.session) navigate(Path.IntiPage);
        }
    }, [userData, auth.session]);

    function handleBack() {
        navigate(Path.HomePage);
    }

    function handleToggleSave() {
        setSaved((prev) => !prev);
    }

    function handlePlay() {
        const first = songs[0];
        if (!first?.id) return;
        const artistName = first.artists?.[0]?.name ?? null;
        audioPlayer.setSongInfo(first.title ?? null, artistName);
        audioPlayer.play(first.id);
    }

    function handlePlaySong(song: SongBase) {
        if (!song.id) return;
        const artistName = song.artists?.[0]?.name ?? null;
        audioPlayer.setSongInfo(song.title ?? null, artistName);
        audioPlayer.play(song.id);
    }

    const totalDuration = computeTotalDuration(songs);

    if (!id || !userData) return null;

    return (
        <div className={cls.AlbumPageContainer}>
            <div className={cls.AmbientWash} />

            <div className={cls.Body}>
                {playlist && (
                    <AlbumSidebar
                        playlist={playlist}
                        totalDuration={totalDuration}
                        saved={saved}
                        onToggleSave={handleToggleSave}
                        onBack={handleBack}
                        onPlay={handlePlay}
                    />
                )}
                <AlbumMainContent
                    songs={songs}
                    currentTrackPath={audioPlayer.trackPath}
                    onPlaySong={handlePlaySong}
                    username={userData.username}
                />
            </div>
        </div>
    );
}
