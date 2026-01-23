'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import SlackStyleComments from '@/components/SlackStyleComments';
import '../../globals.css';

export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [user, setUser] = useState(null);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

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
            loadRequest();
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        }
    };

    const loadRequest = async () => {
        try {
            const response = await fetch(`/api/requests/${params.id}`);
            const data = await response.json();

            if (response.ok) {
                setRequest(data.request);
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Failed to load request:', error);
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/requests/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                setRequest(data.request);
            } else {
                alert(data.error || '상태 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('상태 변경 중 오류가 발생했습니다.');
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading || !user || !request) {
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

    const statusOptions = ['접수', '처리진행', '처리완료'];

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
                        <h1 style={{ fontSize: '1.5rem' }}>서비스 요청 상세</h1>
                        <Link href="/dashboard" className="btn btn-ghost">
                            ← 대시보드로
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container" style={{ marginTop: 'var(--space-xl)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    {/* Request Info */}
                    <div className="card animate-fade-in" style={{ marginBottom: 'var(--space-xl)' }}>
                        <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-lg)' }}>
                            <div className="flex items-center gap-md">
                                <StatusBadge status={request.status} />
                                <span className="text-sm text-secondary">
                                    {request.majorCategory} / {request.minorCategory}
                                </span>
                            </div>
                            <span className="text-sm text-tertiary">
                                {formatDate(request.createdAt)}
                            </span>
                        </div>

                        <h2 style={{
                            fontSize: '1.5rem',
                            marginBottom: 'var(--space-md)'
                        }}>
                            {request.title}
                        </h2>

                        <div style={{
                            padding: 'var(--space-md)',
                            background: 'var(--bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--space-lg)',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.6
                        }}>
                            {request.description}
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-tertiary">
                                요청자: {request.userName}
                            </div>

                            {user.role === 'admin' && (
                                <div className="flex gap-sm">
                                    {statusOptions.map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusChange(status)}
                                            className={`btn ${request.status === status ? 'btn-primary' : 'btn-secondary'}`}
                                            disabled={updating || request.status === status}
                                            style={{
                                                fontSize: '0.75rem',
                                                padding: 'var(--space-xs) var(--space-sm)'
                                            }}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <SlackStyleComments requestId={params.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
