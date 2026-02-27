'use client';

import Link from 'next/link';
import StatusBadge from './StatusBadge';

const formatDate = (d) =>
    new Date(d).toLocaleDateString('ko-KR', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

export default function RequestCard({ request }) {
    return (
        <Link href={`/requests/${request.id}`} className="request-card animate-fade-in">
            <div className="request-card-header">
                <div className="request-card-meta">
                    <StatusBadge status={request.status} />
                    {request.majorCategory && (
                        <span className="text-xs text-muted">
                            {request.majorCategory}
                            {request.minorCategory ? ` / ${request.minorCategory}` : ''}
                        </span>
                    )}
                </div>
                <span className="text-xs text-muted">{formatDate(request.createdAt)}</span>
            </div>

            <div className="request-card-title">{request.title}</div>

            {request.description && (
                <div className="request-card-desc">{request.description}</div>
            )}

            <div className="request-card-footer">
                <span>👤 {request.userName || '—'}</span>
                {request.comments?.length > 0 && (
                    <span>💬 {request.comments.length}</span>
                )}
            </div>
        </Link>
    );
}
