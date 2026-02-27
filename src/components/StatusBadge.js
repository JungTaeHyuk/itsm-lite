'use client';

export default function StatusBadge({ status }) {
    const cls = `badge badge-${status}`;
    return <span className={cls}>{status}</span>;
}
