'use client';

export default function StatusBadge({ status }) {
    const getStatusClass = () => {
        switch (status) {
            case '접수':
                return 'badge-pending';
            case '처리진행':
                return 'badge-in-progress';
            case '처리완료':
                return 'badge-completed';
            default:
                return 'badge-pending';
        }
    };

    return (
        <span className={`badge ${getStatusClass()}`}>
            {status}
        </span>
    );
}
