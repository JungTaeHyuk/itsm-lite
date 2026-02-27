'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../globals.css';

export default function NewRequestPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ majorCategory: '', minorCategory: '', title: '', description: '' });
    const [minorCategories, setMinorCategories] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { checkAuth(); loadCategories(); }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (!data.user) { router.push('/login'); return; }
            setUser(data.user);
        } catch { router.push('/login'); }
    };

    const loadCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            if (res.ok) setCategories(data.categories);
        } catch (e) { console.error(e); }
    };

    const handleMajorChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, majorCategory: val, minorCategory: '' });
        const cat = categories.find(c => c.majorCategory === val);
        setMinorCategories(cat ? cat.minorCategories : []);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || '요청 생성에 실패했습니다.'); setSubmitting(false); return; }
            router.push('/dashboard');
        } catch { setError('요청 생성 중 오류가 발생했습니다.'); setSubmitting(false); }
    };

    if (!user) return <div className="loading-center"><div className="spinner" /></div>;

    const steps = ['카테고리 선택', '요청 내용 작성', '제출'];
    const currentStep = !formData.majorCategory ? 0 : !formData.title ? 1 : 2;

    return (
        <div className="page-wrapper">
            {/* Navbar */}
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-inner">
                        <Link href="/dashboard" className="navbar-logo">
                            <div className="logo-icon">⚡</div>
                            <span className="logo-text">ITSM Lite</span>
                        </Link>
                        <div className="navbar-right">
                            <Link href="/dashboard" className="btn btn-ghost btn-sm">← 대시보드</Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container" style={{ paddingTop: 'var(--sp-8)', paddingBottom: 'var(--sp-16)' }}>
                <div style={{ maxWidth: '760px', margin: '0 auto' }}>
                    {/* Page header */}
                    <div className="page-header">
                        <h1 className="page-title">새 서비스 요청</h1>
                        <p className="page-subtitle">IT 서비스 요청을 작성하고 제출하세요</p>
                    </div>

                    {/* Progress steps */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 'var(--sp-8)' }}>
                        {steps.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                        background: i <= currentStep ? 'linear-gradient(135deg,var(--indigo-500),var(--violet-600))' : 'var(--bg-raised)',
                                        color: i <= currentStep ? 'white' : 'var(--text-muted)',
                                        border: i <= currentStep ? 'none' : '1px solid var(--border-strong)',
                                        boxShadow: i <= currentStep ? '0 0 10px hsla(226,80%,55%,0.3)' : 'none',
                                    }}>
                                        {i < currentStep ? '✓' : i + 1}
                                    </div>
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: i <= currentStep ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {s}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div style={{ flex: 1, height: 2, margin: '0 var(--sp-3)', background: i < currentStep ? 'var(--indigo-500)' : 'var(--border-strong)', transition: 'background 0.3s' }} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form card */}
                    <div className="card animate-slide-up">
                        <form onSubmit={handleSubmit}>
                            {/* Category */}
                            <div style={{ marginBottom: 'var(--sp-6)', paddingBottom: 'var(--sp-6)', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--sp-4)', color: 'var(--text-secondary)' }}>
                                    📂 카테고리
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label htmlFor="majorCategory" className="label">대분류 *</label>
                                        <select
                                            id="majorCategory"
                                            className="input select"
                                            value={formData.majorCategory}
                                            onChange={handleMajorChange}
                                            required
                                        >
                                            <option value="">선택하세요</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.majorCategory}>{c.majorCategory}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label htmlFor="minorCategory" className="label">중분류 *</label>
                                        <select
                                            id="minorCategory"
                                            className="input select"
                                            value={formData.minorCategory}
                                            onChange={e => setFormData({ ...formData, minorCategory: e.target.value })}
                                            required
                                            disabled={!formData.majorCategory}
                                        >
                                            <option value="">선택하세요</option>
                                            {minorCategories.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div>
                                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: 'var(--sp-4)', color: 'var(--text-secondary)' }}>
                                    ✏️ 요청 내용
                                </h3>
                                <div className="form-group">
                                    <label htmlFor="title" className="label">요청 제목 *</label>
                                    <input
                                        id="title"
                                        name="title"
                                        type="text"
                                        className="input"
                                        placeholder="요청 제목을 간략히 입력하세요"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description" className="label">상세 설명 *</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        className="input"
                                        placeholder="요청 내용을 상세하게 입력하세요 (증상, 필요 사항, 참고 정보 등)"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        style={{ minHeight: '180px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

                            <div className="flex gap-3 justify-end">
                                <Link href="/dashboard" className="btn btn-secondary">취소</Link>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? '제출 중...' : '🚀 요청 제출'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
