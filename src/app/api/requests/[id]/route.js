import { NextResponse } from 'next/server';
import { getRequests, saveRequests } from '@/lib/storage';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const requests = await getRequests();
        const serviceRequest = requests.find(req => req.id === id);

        if (!serviceRequest) {
            return NextResponse.json(
                { error: '요청을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        // 권한 확인: 관리자 또는 요청 작성자만 조회 가능
        if (user.role !== 'admin' && serviceRequest.userId !== user.id) {
            return NextResponse.json(
                { error: '접근 권한이 없습니다.' },
                { status: 403 }
            );
        }

        return NextResponse.json({ request: serviceRequest });
    } catch (error) {
        console.error('Get request error:', error);
        return NextResponse.json(
            { error: '요청을 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        // 상태 변경은 관리자만 가능
        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: '관리자만 상태를 변경할 수 있습니다.' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const validStatuses = ['접수', '처리진행', '처리완료'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: '유효하지 않은 상태입니다.' },
                { status: 400 }
            );
        }

        const requests = await getRequests();
        const requestIndex = requests.findIndex(req => req.id === id);

        if (requestIndex === -1) {
            return NextResponse.json(
                { error: '요청을 찾을 수 없습니다.' },
                { status: 404 }
            );
        }

        requests[requestIndex].status = status;
        requests[requestIndex].updatedAt = new Date().toISOString();

        await saveRequests(requests);

        return NextResponse.json({ request: requests[requestIndex] });
    } catch (error) {
        console.error('Update request error:', error);
        return NextResponse.json(
            { error: '요청 업데이트 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
