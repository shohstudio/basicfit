'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Simple hardcoded check
    if (username === 'admin' && password === 'admin123') {
        const cookieStore = await cookies();
        cookieStore.set('auth_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        redirect('/');
    }

    return { error: "Login yoki parol noto'g'ri" };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_session');
    redirect('/login');
}
