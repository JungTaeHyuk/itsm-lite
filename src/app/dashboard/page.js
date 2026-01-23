'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RequestCard from '@/components/RequestCard';
import '../globals.css';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (!data.user) {
                router.push('/login');
                return;
            }

            setUser(data.user);
            loadRequests();
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        }
    };

    const loadRequests = async () => {
        try {
            const response = await fetch('/api/requests');
            const data = await response.json();

            if (response.ok) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error('Failed to load requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading || !user) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div className="text-secondary">로딩 중...</div>
            </div>
        );
    }

    const getStatusCounts = () => {
        return {
            total: requests.length,
            pending: requests.filter(r => r.status === '접수').length,
            inProgress: requests.filter(r => r.status === '처리진행').length,
            completed: requests.filter(r => r.status === '처리완료').length
        };
    };

    const counts = getStatusCounts();

    return (
        <div style={{ minHeight: '100vh', paddingBottom: 'var(--space-3xl)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--glass-border)',
                padding: 'var(--space-lg) 0'
            }}>
                <div className="container">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 style={{
                                fontSize: '1.5rem',
                                background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: 'var(--space-xs)'
                            }}>
                                ITSM Service
                            </h1>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                {user.name}님 환영합니다 ({user.role === 'admin' ? '관리자' : '사용자'})
                            </p>
                        </div>
                        <div className="flex gap-sm">
                            {user.role === 'admin' && (
                                <Link href="/admin" className="btn btn-secondary">
                                    관리자 대시보드
                                </Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-ghost">
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="container" style={{ marginTop: 'var(--space-xl)' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--space-md)',
                    marginBottom: 'var(--space-xl)'
                }}>
                    <div className="card">
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            전체 요청
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{counts.total}</div>
                    </div>
                    <div className="card">
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            접수
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-pending)' }}>
                            {counts.pending}
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            처리진행
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-in-progress)' }}>
                            {counts.inProgress}
                        </div>
                    </div>
                    <div className="card">
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            처리완료
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-completed)' }}>
                            {counts.completed}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>서비스 요청 목록</h2>
                    <Link href="/requests/new" className="btn btn-primary">
                        + 새 요청 작성
                    </Link>
                </div>

                {/* Requests List */}
                {requests.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                        <p className="text-secondary">아직 서비스 요청이 없습니다.</p>
                        <Link href="/requests/new" className="btn btn-primary" style={{ marginTop: 'var(--space-lg)' }}>
                            첫 요청 작성하기
                        </Link>
                    </div>
                ) : (
                    <div>
                        {requests.map(request => (
                            <RequestCard key={request.id} request={request} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
