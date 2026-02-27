'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';

const TEST_ACCOUNTS = [
    { role: '현업', email: 'requester@itsm.com', pw: 'pass123' },
    { role: '승인자', email: 'approver@itsm.com', pw: 'pass123' },
    { role: '처리자', email: 'handler@itsm.com', pw: 'pass123' },
    { role: '관리자', email: 'admin@itsm.com', pw: 'admin123' },
];

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || '로그인에 실패했습니다.'); setLoading(false); return; }
            router.push('/dashboard');
        } catch {
            setError('로그인 처리 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    const fillAccount = (acc) => setFormData({ email: acc.email, password: acc.pw });

    return (
        <div className="login-page">
            <div className="login-box">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">⚡</div>
                    <h1 className="login-title">ITSM Lite</h1>
                    <p className="login-subtitle">IT 서비스 관리 시스템</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="label">이메일</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="input"
                            placeholder="email@company.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="label">비밀번호</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error mb-4">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인 →'}
                    </button>
                </form>

                {/* Test accounts */}
                <hr className="divider" />
                <div>
                    <p className="text-xs text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                        테스트 계정 빠른 선택
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
                        {TEST_ACCOUNTS.map(acc => (
                            <button
                                key={acc.email}
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={() => fillAccount(acc)}
                                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
                            >
                                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{acc.role}</span>
                                &nbsp;{acc.role === '관리자' ? '👑' : acc.role === '승인자' ? '✅' : acc.role === '처리자' ? '🔧' : '📋'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
