'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../globals.css';

export default function NewRequestPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        majorCategory: '',
        minorCategory: '',
        title: '',
        description: ''
    });
    const [minorCategories, setMinorCategories] = useState([]);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        checkAuth();
        loadCategories();
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
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/login');
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch('/api/categories');
            const data = await response.json();

            if (response.ok) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleMajorCategoryChange = (e) => {
        const majorCategory = e.target.value;
        setFormData({
            ...formData,
            majorCategory,
            minorCategory: ''
        });

        const category = categories.find(cat => cat.majorCategory === majorCategory);
        setMinorCategories(category ? category.minorCategories : []);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await fetch('/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || '요청 생성에 실패했습니다.');
                setSubmitting(false);
                return;
            }

            router.push('/dashboard');
        } catch (err) {
            setError('요청 생성 중 오류가 발생했습니다.');
            setSubmitting(false);
        }
    };

    if (!user) {
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
                        <h1 style={{ fontSize: '1.5rem' }}>새 서비스 요청</h1>
                        <Link href="/dashboard" className="btn btn-ghost">
                            ← 대시보드로
                        </Link>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="container" style={{ marginTop: 'var(--space-xl)' }}>
                <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label htmlFor="majorCategory" className="label">대분류 *</label>
                            <select
                                id="majorCategory"
                                name="majorCategory"
                                className="input"
                                value={formData.majorCategory}
                                onChange={handleMajorCategoryChange}
                                required
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">대분류를 선택하세요</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.majorCategory}>
                                        {cat.majorCategory}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label htmlFor="minorCategory" className="label">중분류 *</label>
                            <select
                                id="minorCategory"
                                name="minorCategory"
                                className="input"
                                value={formData.minorCategory}
                                onChange={handleChange}
                                required
                                disabled={!formData.majorCategory}
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">중분류를 선택하세요</option>
                                {minorCategories.map(minor => (
                                    <option key={minor} value={minor}>
                                        {minor}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label htmlFor="title" className="label">요청 제목 *</label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                className="input"
                                placeholder="요청 제목을 입력하세요"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <label htmlFor="description" className="label">상세 설명 *</label>
                            <textarea
                                id="description"
                                name="description"
                                className="input"
                                placeholder="요청 내용을 상세히 입력하세요"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                style={{
                                    minHeight: '200px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
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

                        <div className="flex gap-md">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                                style={{ flex: 1 }}
                            >
                                {submitting ? '생성 중...' : '요청 생성'}
                            </button>
                            <Link href="/dashboard" className="btn btn-secondary">
                                취소
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
