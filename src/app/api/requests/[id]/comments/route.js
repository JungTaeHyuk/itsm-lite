import { NextResponse } from 'next/server';
import { getComments, saveComments } from '@/lib/storage';
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
        const comments = await getComments();
        const requestComments = comments.filter(comment => comment.requestId === id);

        return NextResponse.json({ comments: requestComments });
    } catch (error) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { error: '댓글을 가져오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: '인증이 필요합니다.' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim() === '') {
            return NextResponse.json(
                { error: '댓글 내용을 입력해주세요.' },
                { status: 400 }
            );
        }

        const comments = await getComments();

        const newComment = {
            id: `comment-${Date.now()}`,
            requestId: id,
            userId: user.id,
            userName: user.name,
            userRole: user.role,
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        comments.push(newComment);
        await saveComments(comments);

        return NextResponse.json({ comment: newComment }, { status: 201 });
    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json(
            { error: '댓글 작성 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
