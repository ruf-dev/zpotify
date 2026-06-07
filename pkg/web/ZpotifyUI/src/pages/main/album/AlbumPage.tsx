import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cn from 'classnames';

import cls from '@/pages/main/album/AlbumPage.module.css';
import type { Playlist } from '@/app/api/zpotify';

import useUser from '@/entities/user/useUser.ts';
import { Path } from '@/app/routing/paths.ts';
import { usePlaylist } from '@/pages/main/playlist/usePlaylist.ts';
import GenerativeCover from '@/components/GenerativeCover/GenerativeCover.tsx';
import BackButton from '@/shared/ui/BackButton.tsx';
import RandomArrows from '@/assets/player/ShuffleArrows.tsx';
import PlayIcon from '@/assets/icons/PlayIcon.tsx';
import NowPlayingBars from '@/assets/icons/NowPlayingBars.tsx';

/* ── Mock data (replace when album API is available) ──────── */

interface MockTrack {
    id: number;
    title: string;
    artist: string;
    duration: string;
    liked: boolean;
}

interface MockComment {
    id: number;
    user: string;
    avatar: string;
    time: string;
    text: string;
    likes: number;
}

const MOCK_TRACKS: MockTrack[] = [
    { id: 1, title: 'Neon Drift', artist: 'Various', duration: '3:42', liked: false },
    { id: 2, title: 'Hollow Signal', artist: 'Various', duration: '4:15', liked: true },
    { id: 3, title: 'Glass Shore', artist: 'Various', duration: '5:08', liked: false },
    { id: 4, title: 'Blue Static', artist: 'Various', duration: '3:55', liked: false },
    { id: 5, title: 'Remnants', artist: 'Various', duration: '4:33', liked: true },
    { id: 6, title: 'Slow Cascade', artist: 'Various', duration: '6:01', liked: false },
    { id: 7, title: 'Pale Circuit', artist: 'Various', duration: '3:27', liked: false },
    { id: 8, title: 'Overture', artist: 'Various', duration: '7:19', liked: false },
];

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

const MOCK_GENRES = ['Electronic', 'Ambient', 'Experimental'];
const MOCK_YEAR = 2024;
const MOCK_DURATION = '42 min';
const MOCK_CREDITS = [
    { role: 'Producer', name: 'Lena Kovacs' },
    { role: 'Mastering', name: 'Studio Ariel' },
    { role: 'Artwork', name: 'M. Frost' },
];
const MOCK_LABEL = 'Zpotify Records';

/* ── Helpers ─────────────────────────────────────────────── */

function resolveCoverSeed(playlist: Playlist): number {
    const fileId = playlist.coverFileId ?? '';
    const match = fileId.match(/^generative:(\d+)$/);
    if (match) {
        return parseInt(match[1], 10);
    }
    const uuid = playlist.uuid ?? '0';
    return (uuid.charCodeAt(0) % 7) + 1;
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
    saved: boolean;
    onToggleSave: () => void;
    onBack: () => void;
    onPlay: () => void;
}

function AlbumSidebar({ playlist, saved, onToggleSave, onBack, onPlay }: AlbumSidebarProps) {
    const seed = resolveCoverSeed(playlist);
    const artistName = playlist.artists?.[0]?.name ?? 'Unknown Artist';
    const [aboutExpanded, setAboutExpanded] = useState(false);

    function handleToggleAbout() {
        setAboutExpanded((prev) => !prev);
    }

    return (
        <div className={cls.Sidebar}>
            <BackButton onClick={onBack} />

            <div className={cls.CoverWrapper}>
                <GenerativeCover seed={seed} size={220} borderRadius="0" />
            </div>

            <div className={cls.TitleBlock}>
                <span className={cls.TypeLabel}>album</span>
                <h1 className={cls.AlbumName}>{playlist.name}</h1>
                <span className={cls.ArtistName}>{artistName}</span>
                <div className={cls.MetaRow}>
                    <span>{MOCK_YEAR}</span>
                    <span>·</span>
                    <span>{playlist.songCount ?? 0} tracks</span>
                    <span>·</span>
                    <span>{MOCK_DURATION}</span>
                </div>
            </div>

            <div className={cls.GenreChipsRow}>
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
                <span className={cls.LabelPillLabel}>label</span>
                <span className={cls.LabelPillName}>{MOCK_LABEL}</span>
            </div>
        </div>
    );
}

/* ── AlbumTrackRow ───────────────────────────────────────── */

interface AlbumTrackRowProps {
    track: MockTrack;
    index: number;
    isPlaying: boolean;
    isLiked: boolean;
    isHeartAnimating: boolean;
    onPlay: () => void;
    onToggleLike: () => void;
}

function AlbumTrackRow({
    track,
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
                <span className={cn(cls.TrackTitle, isPlaying && cls.TrackTitlePlaying)}>{track.title}</span>
                <span className={cls.TrackArtist}>{track.artist}</span>
            </div>

            <button
                type="button"
                className={cn(cls.HeartIcon, isLiked && cls.HeartIconLiked, isHeartAnimating && cls.HeartPop)}
                onClick={handleHeartClick}
                aria-label={isLiked ? 'Unlike track' : 'Like track'}
            >
                <HeartSvg filled={isLiked} />
            </button>

            <span className={cls.TrackDuration}>{track.duration}</span>

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
    playingId: number | null;
    onSetPlayingId: (id: number | null) => void;
    username: string;
}

function AlbumMainContent({ playingId, onSetPlayingId, username }: AlbumMainContentProps) {
    const [likedTracks, setLikedTracks] = useState<Set<number>>(
        () => new Set(MOCK_TRACKS.filter((t) => t.liked).map((t) => t.id)),
    );
    const [animatingHeartId, setAnimatingHeartId] = useState<number | null>(null);

    function handleToggleLike(trackId: number) {
        setLikedTracks((prev) => {
            const next = new Set(prev);
            if (next.has(trackId)) {
                next.delete(trackId);
            } else {
                next.add(trackId);
            }
            return next;
        });
        setAnimatingHeartId(trackId);
        setTimeout(() => setAnimatingHeartId(null), 350);
    }

    function handleTogglePlay(trackId: number) {
        onSetPlayingId(playingId === trackId ? null : trackId);
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
                {MOCK_TRACKS.map((track, i) => (
                    <AlbumTrackRow
                        key={track.id}
                        track={track}
                        index={i + 1}
                        isPlaying={playingId === track.id}
                        isLiked={likedTracks.has(track.id)}
                        isHeartAnimating={animatingHeartId === track.id}
                        onPlay={() => handleTogglePlay(track.id)}
                        onToggleLike={() => handleToggleLike(track.id)}
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

    const [playingId, setPlayingId] = useState<number | null>(() => {
        try {
            const raw = localStorage.getItem('zp_album_page');
            return raw ? (JSON.parse(raw).playingId ?? null) : null;
        } catch {
            return null;
        }
    });
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        localStorage.setItem('zp_album_page', JSON.stringify({ playingId }));
    }, [playingId]);

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
        const firstId = MOCK_TRACKS[0]?.id ?? null;
        setPlayingId((prev) => (prev !== null ? null : firstId));
    }

    if (!id || !userData) return null;

    return (
        <div className={cls.AlbumPageContainer}>
            <div className={cls.AmbientWash} />

            <div className={cls.Body}>
                {playlist && (
                    <AlbumSidebar
                        playlist={playlist}
                        saved={saved}
                        onToggleSave={handleToggleSave}
                        onBack={handleBack}
                        onPlay={handlePlay}
                    />
                )}
                <AlbumMainContent playingId={playingId} onSetPlayingId={setPlayingId} username={userData.username} />
            </div>
        </div>
    );
}
