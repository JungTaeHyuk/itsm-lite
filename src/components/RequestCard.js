'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';

export default function RequestCard({ request }) {
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

    return (
        <Link href={`/requests/${request.id}`} style={{ textDecoration: 'none' }}>
            <div className="card animate-fade-in" style={{
                cursor: 'pointer',
                marginBottom: 'var(--space-md)'
            }}>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
                    <div className="flex items-center gap-sm">
                        <StatusBadge status={request.status} />
                        <span className="text-sm text-secondary">
                            {request.majorCategory} / {request.minorCategory}
                        </span>
                    </div>
                    <span className="text-sm text-tertiary">
                        {formatDate(request.createdAt)}
                    </span>
                </div>

                <h3 style={{
                    fontSize: '1.125rem',
                    marginBottom: 'var(--space-sm)',
                    color: 'var(--text-primary)'
                }}>
                    {request.title}
                </h3>

                <p className="text-secondary" style={{
                    fontSize: '0.875rem',
                    marginBottom: 'var(--space-sm)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {request.description}
                </p>

                <div className="text-sm text-tertiary">
                    요청자: {request.userName}
                </div>
            </div>
        </Link>
    );
}
