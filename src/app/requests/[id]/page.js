'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import SlackStyleComments from '@/components/SlackStyleComments';
import '../../globals.css';

const WORKFLOW = ['요청', '요청승인', '접수', '처리진행', '처리완료', '만족도조사', '종료'];

const STATUS_ACTIONS = {
    requester: { '요청': null },
    approver: { '요청': ['요청승인', '반려'] },
    handler: { '요청승인': ['접수'], '접수': ['처리진행'], '처리진행': ['처리완료'], '만족도조사': ['종료'] },
    admin: { '요청': ['요청승인', '반려'], '요청승인': ['접수'], '접수': ['처리진행'], '처리진행': ['처리완료'], '만족도조사': ['종료'] },
};

const ACTION_STYLE = {
    '요청승인': 'btn-success',
    '접수': 'btn-primary',
    '처리진행': 'btn-primary',
    '처리완료': 'btn-success',
    '종료': 'btn-secondary',
    '반려': 'btn-danger',
};

const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});

export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState(null);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => { checkAuth(); }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.user) { router.push('/login'); return; }
            setUser(data.user);
            loadRequest();
        } catch { router.push('/login'); }
    };

    const loadRequest = async () => {
        try {
            const res = await fetch(`/api/requests/${params.id}`);
            const data = await res.json();
            if (res.ok) setRequest(data.request);
            else router.push('/dashboard');
        } catch { router.push('/dashboard'); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/requests/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (res.ok) setRequest(data.request);
            else alert(data.error || '상태 변경 실패');
        } catch { alert('상태 변경 중 오류 발생'); }
        finally { setUpdating(false); }
    };

    if (loading || !user || !request) return <div className="loading-center"><div className="spinner" /></div>;

    const currentIdx = WORKFLOW.indexOf(request.status);
    const availableActions = STATUS_ACTIONS[user.role]?.[request.status] || [];

    return (
        <div className="page-wrapper">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <Link href="/dashboard" className="navbar-logo">
                            <div className="logo-icon">⚡</div>
                            <span className="logo-text">ITSM Lite</span>
                        </Link>
                        <div className="navbar-right">
                            <Link href="/dashboard" className="btn btn-ghost btn-sm">← 목록으로</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-16)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                    {/* Title + status */}
                    <div className="page-header">
                        <div className="flex items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
                            <StatusBadge status={request.status} />
                            {request.majorCategory && (
                                <span className="text-xs text-muted">
                                    {request.majorCategory} / {request.minorCategory}
                                </span>
                            )}
                            <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
                                {formatDate(request.createdAt)}
                            </span>
                        </div>
                        <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{request.title}</h1>
                        <p className="page-subtitle">요청자: {request.userName}</p>
                    </div>

                    {/* Workflow stepper */}
                    <div className="card mb-6" style={{ padding: 'var(--sp-5) var(--sp-6)' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--sp-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            진행 상태
                        </div>
                        <div className="workflow-stepper">
                            {WORKFLOW.map((step, i) => (
                                <div key={step} className={`workflow-step${i <= currentIdx ? ' active' : ''}${i === currentIdx ? ' current' : ''}`}>
                                    <div className="step-circle">
                                        {i < currentIdx ? '✓' : i + 1}
                                    </div>
                                    <div className="step-label">{step}</div>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        {availableActions.length > 0 && (
                            <div style={{ marginTop: 'var(--sp-5)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: 'var(--sp-2)' }}>상태 변경:</span>
                                {availableActions.map(action => (
                                    <button
                                        key={action}
                                        onClick={() => handleStatusChange(action)}
                                        className={`btn btn-sm ${ACTION_STYLE[action] || 'btn-secondary'}`}
                                        disabled={updating}
                                    >
                                        {updating ? '처리 중...' : action}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Request content */}
                    <div className="card mb-6">
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 'var(--sp-4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            요청 내용
                        </div>
                        <div style={{
                            background: 'var(--bg-raised)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-md)',
                            padding: 'var(--sp-5)',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.7,
                            fontSize: '0.9375rem',
                            color: 'var(--text-secondary)',
                        }}>
                            {request.description}
                        </div>

                        {/* Meta */}
                        <div style={{ marginTop: 'var(--sp-5)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
                            {[
                                { label: '요청자', value: request.userName },
                                { label: '생성일시', value: formatDate(request.createdAt) },
                                { label: '최종수정', value: formatDate(request.updatedAt) },
                            ].map(m => (
                                <div key={m.label} style={{
                                    background: 'var(--bg-raised)', borderRadius: 'var(--r-md)',
                                    padding: 'var(--sp-3) var(--sp-4)'
                                }}>
                                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                                        {m.label}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {m.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Comments */}
                    <SlackStyleComments requestId={params.id} />
                </div>
            </div>
        </div>
    );
}
