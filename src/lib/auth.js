import { cookies } from 'next/headers';
import { getUsers } from './storage';

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
        return null;
    }

    try {
        const session = JSON.parse(sessionCookie.value);
        const users = await getUsers();
        const user = users.find(u => u.id === session.userId);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }

        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

export async function createSession(userId) {
    const session = {
        userId,
        createdAt: new Date().toISOString()
    };

    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return session;
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
}
