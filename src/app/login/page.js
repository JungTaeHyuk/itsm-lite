'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../globals.css';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || '로그인에 실패했습니다.');
                setLoading(false);
                return;
            }

            router.push('/dashboard');
        } catch (err) {
            setError('로그인 처리 중 오류가 발생했습니다.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-lg)'
        }}>
            <div className="card animate-fade-in" style={{
                width: '100%',
                maxWidth: '400px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        background: 'linear-gradient(135deg, var(--primary-400), var(--primary-600))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 'var(--space-sm)'
                    }}>
                        ITSM Service
                    </h1>
                    <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                        IT 서비스 관리 시스템에 오신 것을 환영합니다
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label htmlFor="email" className="label">이메일</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="input"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoFocus
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--space-lg)' }}>
                        <label htmlFor="password" className="label">비밀번호</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'hsla(0, 84%, 60%, 0.1)',
                            border: '1px solid hsla(0, 84%, 60%, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--accent-error)',
                            fontSize: '0.875rem',
                            marginBottom: 'var(--space-lg)'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%' }}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div style={{
                    marginTop: 'var(--space-xl)',
                    padding: 'var(--space-md)',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)'
                }}>
                    <p style={{ marginBottom: 'var(--space-xs)', fontWeight: 600 }}>테스트 계정:</p>
                    <p>관리자: admin@itsm.com / admin123</p>
                    <p style={{ marginBottom: 0 }}>사용자: user@itsm.com / user123</p>
                </div>
            </div>
        </div>
    );
}
