'use client';

import { useState, useEffect, useRef } from 'react';

const ROLE_LABEL = { admin: '관리자', approver: '승인자', handler: '처리자', requester: '현업' };
const ROLE_COLOR = {
    admin: 'linear-gradient(135deg,hsl(258,84%,58%),hsl(226,80%,55%))',
    approver: 'linear-gradient(135deg,hsl(152,68%,40%),hsl(170,60%,35%))',
    handler: 'linear-gradient(135deg,hsl(200,88%,50%),hsl(220,80%,50%))',
    requester: 'linear-gradient(135deg,hsl(38,96%,48%),hsl(28,90%,45%))',
};

const formatTime = (d) => {
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);
    if (m < 1) return '방금 전';
    if (m < 60) return `${m}분 전`;
    if (h < 24) return `${h}시간 전`;
    if (day < 7) return `${day}일 전`;
    return new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function SlackStyleComments({ requestId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { loadComments(); }, [requestId]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [comments]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/requests/${requestId}/comments`);
            const data = await res.json();
            if (res.ok) setComments(data.comments);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/requests/${requestId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });
            const data = await res.json();
            if (res.ok) { setComments([...comments, data.comment]); setNewComment(''); }
        } catch (e) { console.error(e); }
        finally { setSubmitting(false); }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e);
    };

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: 'var(--sp-4) var(--sp-6)',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-raised)',
                display: 'flex', alignItems: 'center', gap: 'var(--sp-3)'
            }}>
                <span style={{ fontSize: '1.125rem' }}>💬</span>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>댓글</span>
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '0.75rem', fontWeight: 600,
                    background: 'var(--bg-overlay)', color: 'var(--text-muted)',
                    padding: '2px 8px', borderRadius: 'var(--r-full)'
                }}>
                    {comments.length}개
                </span>
            </div>

            {/* Comments list */}
            <div style={{ maxHeight: '420px', overflowY: 'auto', padding: 'var(--sp-5) var(--sp-6)' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--sp-8)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <div className="spinner" style={{ margin: '0 auto 12px' }} />
                        댓글 불러오는 중...
                    </div>
                ) : comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--sp-10)', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>💭</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>아직 댓글이 없습니다</div>
                        <div style={{ fontSize: '0.8125rem', marginTop: 'var(--sp-1)' }}>첫 댓글을 남겨보세요!</div>
                    </div>
                ) : (
                    <div className="comment-list">
                        {comments.map((c, i) => (
                            <div key={c.id} className="comment-item" style={{ animationDelay: `${i * 40}ms` }}>
                                <div className="comment-avatar" style={{ background: ROLE_COLOR[c.userRole] || ROLE_COLOR.requester }}>
                                    {c.userName?.slice(0, 2) || '?'}
                                </div>
                                <div className="comment-bubble">
                                    <div className="comment-header">
                                        <div className="flex items-center gap-2">
                                            <span className="comment-author">{c.userName}</span>
                                            {c.userRole && (
                                                <span style={{
                                                    fontSize: '0.6875rem', fontWeight: 700,
                                                    padding: '1px 6px', borderRadius: 'var(--r-full)',
                                                    background: 'var(--bg-overlay)', color: 'var(--text-muted)',
                                                    textTransform: 'uppercase', letterSpacing: '0.04em'
                                                }}>
                                                    {ROLE_LABEL[c.userRole] || c.userRole}
                                                </span>
                                            )}
                                        </div>
                                        <span className="comment-time">{formatTime(c.createdAt)}</span>
                                    </div>
                                    <div className="comment-body" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                        {c.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: 'var(--sp-4) var(--sp-6)', borderTop: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ position: 'relative' }}>
                        <textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="댓글을 입력하세요... (Ctrl+Enter로 전송)"
                            className="input"
                            style={{ minHeight: '80px', resize: 'none', paddingBottom: '44px' }}
                            disabled={submitting}
                        />
                        <div style={{ position: 'absolute', bottom: 'var(--sp-3)', right: 'var(--sp-3)', display: 'flex', gap: 'var(--sp-2)', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {newComment.length > 0 && `${newComment.length}자`}
                            </span>
                            <button
                                type="submit"
                                className="btn btn-primary btn-sm"
                                disabled={submitting || !newComment.trim()}
                            >
                                {submitting ? '전송 중...' : '전송 ↑'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
