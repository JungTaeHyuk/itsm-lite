'use client';

import { useState, useEffect, useRef } from 'react';

export default function SlackStyleComments({ requestId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const commentsEndRef = useRef(null);

    useEffect(() => {
        loadComments();
    }, [requestId]);

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const scrollToBottom = () => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadComments = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/requests/${requestId}/comments`);
            const data = await response.json();
            if (response.ok) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/requests/${requestId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });

            const data = await response.json();

            if (response.ok) {
                setComments([...comments, data.comment]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        return name.charAt(0).toUpperCase();
    };

    const getRoleColor = (role) => {
        return role === 'admin' ? 'var(--primary-500)' : 'var(--gray-500)';
    };

    return (
        <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden'
        }}>
            {/* Comments Header */}
            <div style={{
                padding: 'var(--space-md) var(--space-lg)',
                borderBottom: '1px solid var(--glass-border)',
                background: 'var(--bg-tertiary)'
            }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    댓글 {comments.length}개
                </h3>
            </div>

            {/* Comments List */}
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: 'var(--space-lg)'
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-tertiary)' }}>
                        로딩 중...
                    </div>
                ) : comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--text-tertiary)' }}>
                        아직 댓글이 없습니다. 첫 댓글을 작성해보세요!
                    </div>
                ) : (
                    comments.map((comment, index) => (
                        <div
                            key={comment.id}
                            className="animate-slide-in"
                            style={{
                                marginBottom: index < comments.length - 1 ? 'var(--space-lg)' : 0,
                                animationDelay: `${index * 50}ms`
                            }}
                        >
                            <div className="flex gap-md">
                                {/* Avatar */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: 'var(--radius-md)',
                                    background: getRoleColor(comment.userRole),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    flexShrink: 0
                                }}>
                                    {getInitials(comment.userName)}
                                </div>

                                {/* Comment Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-xs)' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                            {comment.userName}
                                        </span>
                                        {comment.userRole === 'admin' && (
                                            <span style={{
                                                fontSize: '0.625rem',
                                                padding: '2px 6px',
                                                background: 'hsla(220, 70%, 48%, 0.15)',
                                                color: 'var(--primary-400)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontWeight: 600,
                                                textTransform: 'uppercase'
                                            }}>
                                                관리자
                                            </span>
                                        )}
                                        <span className="text-tertiary" style={{ fontSize: '0.75rem' }}>
                                            {formatTime(comment.createdAt)}
                                        </span>
                                    </div>

                                    <div style={{
                                        fontSize: '0.875rem',
                                        lineHeight: 1.5,
                                        color: 'var(--text-primary)',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={commentsEndRef} />
            </div>

            {/* Comment Input */}
            <div style={{
                padding: 'var(--space-lg)',
                borderTop: '1px solid var(--glass-border)',
                background: 'var(--bg-tertiary)'
            }}>
                <form onSubmit={handleSubmit}>
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-sm)',
                        alignItems: 'flex-end'
                    }}>
                        <div style={{ flex: 1 }}>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                className="input"
                                style={{
                                    minHeight: '80px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                                disabled={submitting}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || !newComment.trim()}
                            style={{
                                height: '40px',
                                opacity: submitting || !newComment.trim() ? 0.5 : 1
                            }}
                        >
                            {submitting ? '전송 중...' : '전송'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
