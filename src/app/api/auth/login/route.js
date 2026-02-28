import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 🔐 Demo credentials (replace with DB later)
    if (email === 'admin@hospital.com' && password === 'admin123') {
      const response = NextResponse.json(
        { message: 'Login successful' },
        { status: 200 }
      );

      // ✅ Set cookie (simple auth flag)
      response.cookies.set('admin-auth', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 2, // 2 hours
      });

      return response;
    }

    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
