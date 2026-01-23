import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/storage';

export async function GET() {
    try {
        const categories = await getCategories();
        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: '카테고리를 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
