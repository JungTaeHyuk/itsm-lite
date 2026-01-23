'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RequestCard from '@/components/RequestCard';
import '../globals.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (!data.user || data.user.role !== 'admin') {
                router.push('/dashboard');
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

    const getFilteredRequests = () => {
        if (filter === 'all') return requests;
        return requests.filter(r => r.status === filter);
    };

    const counts = getStatusCounts();
    const filteredRequests = getFilteredRequests();

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
                                관리자 대시보드
                            </h1>
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                전체 서비스 요청 현황 관리
                            </p>
                        </div>
                        <Link href="/dashboard" className="btn btn-ghost">
                            ← 일반 대시보드로
                        </Link>
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
                    <div
                        className="card"
                        style={{ cursor: 'pointer', opacity: filter === 'all' ? 1 : 0.6 }}
                        onClick={() => setFilter('all')}
                    >
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            전체 요청
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{counts.total}</div>
                    </div>
                    <div
                        className="card"
                        style={{ cursor: 'pointer', opacity: filter === '접수' ? 1 : 0.6 }}
                        onClick={() => setFilter('접수')}
                    >
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            접수
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-pending)' }}>
                            {counts.pending}
                        </div>
                    </div>
                    <div
                        className="card"
                        style={{ cursor: 'pointer', opacity: filter === '처리진행' ? 1 : 0.6 }}
                        onClick={() => setFilter('처리진행')}
                    >
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            처리진행
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-in-progress)' }}>
                            {counts.inProgress}
                        </div>
                    </div>
                    <div
                        className="card"
                        style={{ cursor: 'pointer', opacity: filter === '처리완료' ? 1 : 0.6 }}
                        onClick={() => setFilter('처리완료')}
                    >
                        <div className="text-tertiary" style={{ fontSize: '0.75rem', marginBottom: 'var(--space-xs)' }}>
                            처리완료
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--status-completed)' }}>
                            {counts.completed}
                        </div>
                    </div>
                </div>

                {/* Filter Info */}
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h2 style={{ fontSize: '1.25rem' }}>
                        {filter === 'all' ? '전체 요청' : `${filter} 요청`} ({filteredRequests.length})
                    </h2>
                    {filter !== 'all' && (
                        <button onClick={() => setFilter('all')} className="btn btn-ghost">
                            필터 초기화
                        </button>
                    )}
                </div>

                {/* Requests List */}
                {filteredRequests.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
                        <p className="text-secondary">
                            {filter === 'all' ? '아직 서비스 요청이 없습니다.' : `${filter} 상태의 요청이 없습니다.`}
                        </p>
                    </div>
                ) : (
                    <div>
                        {filteredRequests.map(request => (
                            <RequestCard key={request.id} request={request} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
