import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    // 1. Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kredensial tidak valid' },
        { status: 401 }
      );
    }

    // 2. Check Role (Only ADMIN or ARTISAN allowed)
    if (user.role !== 'ADMIN' && user.role !== 'ARTISAN') {
      return NextResponse.json(
        { success: false, error: 'Akses Ditolak: Portal ini hanya untuk Admin & Artisan' },
        { status: 403 }
      );
    }

    // 3. Verify Password
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { success: false, error: 'Kredensial tidak valid' },
        { status: 401 }
      );
    }

    // 4. Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 5. Generate secure session token
    const token = createSessionToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as 'ADMIN' | 'ARTISAN',
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    // 6. Set secure HttpOnly cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
