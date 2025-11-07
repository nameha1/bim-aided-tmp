import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'reCAPTCHA token is required' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(verificationUrl, {
      method: 'POST',
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({ success: true, message: 'reCAPTCHA verified successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'reCAPTCHA verification failed', 'error-codes': data['error-codes'] }, { status: 400 });
    }

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', message: error.message }, { status: 500 });
  }
}
