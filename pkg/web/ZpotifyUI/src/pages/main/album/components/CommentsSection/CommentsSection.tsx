import { useState, type ChangeEvent } from 'react';
import cn from 'classnames';

import cls from '@/pages/main/album/components/CommentsSection/CommentsSection.module.css';
import { HeartIcon } from '@/assets/icons/HeartIcon.tsx';

interface MockComment {
    id: number;
    user: string;
    avatar: string;
    time: string;
    text: string;
    likes: number;
}

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

export interface CommentsSectionProps {
    username: string;
}

export default function CommentsSection({ username }: CommentsSectionProps) {
    const [commentText, setCommentText] = useState('');
    const [likedCommentIds, setLikedCommentIds] = useState<Set<number>>(new Set());
    const [commentLikeCounts, setCommentLikeCounts] = useState<Record<number, number>>(
        Object.fromEntries(MOCK_COMMENTS.map((c) => [c.id, c.likes])),
    );

    function handleCommentTextChange(e: ChangeEvent<HTMLTextAreaElement>) {
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
        <div className={cls.CommentsSectionContainer}>
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
                                        <HeartIcon filled={isLiked} />
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
