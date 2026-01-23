import { NextResponse } from 'next/server';
import { getRequests, saveRequests } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const requests = await getRequests();

        // 관리자는 모든 요청, 일반 사용자는 자신의 요청만
        const filteredRequests = user.role === 'admin'
            ? requests
            : requests.filter(req => req.userId === user.id);

        return NextResponse.json({ requests: filteredRequests });
    } catch (error) {
        console.error('Get requests error:', error);
        return NextResponse.json(
            { error: '요청 목록을 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { majorCategory, minorCategory, title, description } = body;

        if (!majorCategory || !minorCategory || !title || !description) {
            return NextResponse.json(
                { error: '모든 필드를 입력해주세요.' },
                { status: 400 }
            );
        }

        const requests = await getRequests();

        const newRequest = {
            id: `req-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            majorCategory,
            minorCategory,
            title,
            description,
            status: '접수',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        requests.push(newRequest);
        await saveRequests(requests);

        return NextResponse.json({ request: newRequest }, { status: 201 });
    } catch (error) {
        console.error('Create request error:', error);
        return NextResponse.json(
            { error: '요청 생성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
