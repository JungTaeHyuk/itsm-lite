'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RequestCard from '@/components/RequestCard';
import '../globals.css';

const ROLE_LABEL = {
    requester: '현업',
    approver: '승인자',
    handler: '처리자',
    admin: '관리자',
};

const ROLE_ICON = {
    requester: '📋',
    approver: '✅',
    handler: '🔧',
    admin: '👑',
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { checkAuth(); }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.user) { router.push('/login'); return; }
            setUser(data.user);
            loadRequests();
        } catch { router.push('/login'); }
    };

    const loadRequests = async () => {
        try {
            const res = await fetch('/api/requests');
            const data = await res.json();
            if (res.ok) setRequests(data.requests);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    if (loading || !user) {
        return (
            <div className="loading-center">
                <div className="spinner" />
            </div>
        );
    }

    const counts = {
        total: requests.length,
        pending: requests.filter(r => ['요청', '요청승인'].includes(r.status)).length,
        inProgress: requests.filter(r => ['접수', '처리진행'].includes(r.status)).length,
        done: requests.filter(r => ['처리완료', '만족도조사', '종료'].includes(r.status)).length,
    };

    const filtered = filter === 'all' ? requests
        : filter === 'pending' ? requests.filter(r => ['요청', '요청승인'].includes(r.status))
            : filter === 'inProgress' ? requests.filter(r => ['접수', '처리진행'].includes(r.status))
                : requests.filter(r => ['처리완료', '만족도조사', '종료'].includes(r.status));

    const initials = user.name?.slice(0, 2) || user.email?.slice(0, 2).toUpperCase() || '??';

    return (
        <div className="page-wrapper">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <div className="navbar-logo">
                            <div className="logo-icon">⚡</div>
                            <span className="logo-text">ITSM Lite</span>
                        </div>
                        <div className="navbar-right">
                            <div className="user-chip">
                                <div className="user-avatar">{initials}</div>
                                {user.name} &nbsp;·&nbsp; {ROLE_ICON[user.role]} {ROLE_LABEL[user.role] || user.role}
                            </div>
                            {user.role === 'admin' && (
                                <Link href="/admin" className="btn btn-secondary btn-sm">관리자</Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">로그아웃</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* App Layout */}
            <div className="app-layout container">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section">
                        <div className="sidebar-label">메뉴</div>
                        <Link href="/dashboard" className="sidebar-item active">
                            <span className="sidebar-item-icon">🏠</span> 대시보드
                        </Link>
                        <Link href="/requests/new" className="sidebar-item">
                            <span className="sidebar-item-icon">✏️</span> 새 요청 작성
                        </Link>
                    </div>
                    <div className="sidebar-section">
                        <div className="sidebar-label">필터</div>
                        {[
                            { key: 'all', label: '전체 요청', icon: '📂', count: counts.total },
                            { key: 'pending', label: '대기 중', icon: '⏳', count: counts.pending },
                            { key: 'inProgress', label: '처리 중', icon: '⚙️', count: counts.inProgress },
                            { key: 'done', label: '완료', icon: '✅', count: counts.done },
                        ].map(f => (
                            <button
                                key={f.key}
                                className={`sidebar-item${filter === f.key ? ' active' : ''}`}
                                onClick={() => setFilter(f.key)}
                            >
                                <span className="sidebar-item-icon">{f.icon}</span>
                                {f.label}
                                <span style={{
                                    marginLeft: 'auto',
                                    fontSize: '0.75rem',
                                    background: 'var(--bg-overlay)',
                                    padding: '2px 7px',
                                    borderRadius: 'var(--r-full)',
                                    color: 'var(--text-muted)',
                                }}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main */}
                <main className="main-content">
                    {/* Page header */}
                    <div className="page-header flex items-center justify-between">
                        <div>
                            <h1 className="page-title">대시보드</h1>
                            <p className="page-subtitle">{user.name}님, 안녕하세요 👋</p>
                        </div>
                        <Link href="/requests/new" className="btn btn-primary">
                            ✏️ 새 요청 작성
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card stat-total" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon">📂</div>
                            <div className="stat-value">{counts.total}</div>
                            <div className="stat-label">전체 요청</div>
                        </div>
                        <div className="stat-card stat-pending" onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon">⏳</div>
                            <div className="stat-value">{counts.pending}</div>
                            <div className="stat-label">대기 중</div>
                        </div>
                        <div className="stat-card stat-progress" onClick={() => setFilter('inProgress')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon">⚙️</div>
                            <div className="stat-value">{counts.inProgress}</div>
                            <div className="stat-label">처리 중</div>
                        </div>
                        <div className="stat-card stat-done" onClick={() => setFilter('done')} style={{ cursor: 'pointer' }}>
                            <div className="stat-icon">✅</div>
                            <div className="stat-value">{counts.done}</div>
                            <div className="stat-label">완료</div>
                        </div>
                    </div>

                    {/* Request list */}
                    <div className="section-header">
                        <span className="section-title">
                            {filter === 'all' ? '전체 요청' : filter === 'pending' ? '대기 중인 요청' : filter === 'inProgress' ? '처리 중인 요청' : '완료된 요청'}
                            <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                                ({filtered.length}건)
                            </span>
                        </span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <div className="empty-state-title">요청이 없습니다</div>
                                <div className="empty-state-desc">아직 서비스 요청이 없습니다.</div>
                                <Link href="/requests/new" className="btn btn-primary">
                                    첫 요청 작성하기
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {filtered.map(req => (
                                <RequestCard key={req.id} request={req} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
