'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import '../globals.css';

const WORKFLOW = ['요청', '요청승인', '접수', '처리진행', '처리완료', '만족도조사', '종료'];

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { checkAuth(); }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.user || data.user.role !== 'admin') { router.push('/dashboard'); return; }
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

    if (loading || !user) return <div className="loading-center"><div className="spinner" /></div>;

    const counts = WORKFLOW.reduce((acc, s) => {
        acc[s] = requests.filter(r => r.status === s).length;
        return acc;
    }, { total: requests.length });

    const filteredRequests = requests
        .filter(r => filter === 'all' || r.status === filter)
        .filter(r => !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.userName?.includes(search));

    const formatDate = (d) => new Date(d).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="page-wrapper">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <div className="navbar-logo">
                            <div className="logo-icon">⚡</div>
                            <span className="logo-text">ITSM Lite</span>
                            <span style={{
                                fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.06em', color: 'var(--violet-400)',
                                background: 'hsla(258,84%,58%,0.12)', padding: '2px 8px',
                                borderRadius: 'var(--r-full)', border: '1px solid hsla(258,84%,58%,0.25)'
                            }}>Admin</span>
                        </div>
                        <div className="navbar-right">
                            <Link href="/dashboard" className="btn btn-ghost btn-sm">← 대시보드</Link>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">로그아웃</button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="app-layout container">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-section">
                        <div className="sidebar-label">상태 필터</div>
                        <button className={`sidebar-item${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
                            <span className="sidebar-item-icon">📊</span> 전체
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'var(--bg-overlay)', padding: '1px 7px', borderRadius: 'var(--r-full)', color: 'var(--text-muted)' }}>{counts.total}</span>
                        </button>
                        {WORKFLOW.map(s => (
                            <button key={s} className={`sidebar-item${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                                <span className="sidebar-item-icon">·</span> {s}
                                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'var(--bg-overlay)', padding: '1px 7px', borderRadius: 'var(--r-full)', color: 'var(--text-muted)' }}>{counts[s] || 0}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Main */}
                <main className="main-content">
                    {/* Page header */}
                    <div className="page-header flex items-center justify-between">
                        <div>
                            <h1 className="page-title">관리자 대시보드</h1>
                            <p className="page-subtitle">전체 서비스 요청 현황 및 관리</p>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                        {[
                            { label: '전체', value: counts.total, cls: 'stat-total', icon: '📂' },
                            { label: '요청', value: counts['요청'] || 0, cls: 'stat-pending', icon: '🆕' },
                            { label: '처리진행', value: counts['처리진행'] || 0, cls: 'stat-progress', icon: '⚙️' },
                            { label: '처리완료', value: counts['처리완료'] || 0, cls: 'stat-done', icon: '✅' },
                            { label: '종료', value: counts['종료'] || 0, cls: 'stat-done', icon: '🏁' },
                        ].map(s => (
                            <div key={s.label} className={`stat-card ${s.cls}`} onClick={() => setFilter(s.label === '전체' ? 'all' : s.label)} style={{ cursor: 'pointer' }}>
                                <div className="stat-icon" style={{ fontSize: '1.25rem' }}>{s.icon}</div>
                                <div className="stat-value" style={{ fontSize: '1.75rem' }}>{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Search + filter info */}
                    <div className="flex gap-3 items-center mb-6">
                        <input
                            type="text"
                            className="input"
                            placeholder="🔍  제목 또는 요청자 검색..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ maxWidth: '360px' }}
                        />
                        {filter !== 'all' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => setFilter('all')}>✕ 필터 해제</button>
                        )}
                        <span className="text-sm text-muted" style={{ marginLeft: 'auto' }}>
                            {filteredRequests.length}건
                        </span>
                    </div>

                    {/* Table */}
                    {filteredRequests.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <div className="empty-state-title">해당 요청이 없습니다</div>
                                <div className="empty-state-desc">조건에 맞는 서비스 요청이 없습니다.</div>
                            </div>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>상태</th>
                                        <th>제목</th>
                                        <th>요청자</th>
                                        <th>카테고리</th>
                                        <th>생성일시</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map(r => (
                                        <tr key={r.id}>
                                            <td><StatusBadge status={r.status} /></td>
                                            <td>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                                    {r.title}
                                                </span>
                                            </td>
                                            <td>{r.userName || '—'}</td>
                                            <td>
                                                <span className="text-xs text-muted">
                                                    {r.majorCategory}{r.minorCategory ? ` / ${r.minorCategory}` : ''}
                                                </span>
                                            </td>
                                            <td className="text-xs text-muted">{formatDate(r.createdAt)}</td>
                                            <td>
                                                <Link href={`/requests/${r.id}`} className="btn btn-ghost btn-sm">
                                                    보기 →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
