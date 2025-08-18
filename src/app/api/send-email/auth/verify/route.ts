import { NextResponse } from 'next/server';

export interface VerifyResponse {
  success: boolean;
  user?: {
    id: string;
    wallet?: string;
    email?: string;
  };
  error?: string;
}

export async function POST(req: Request): Promise<NextResponse<VerifyResponse>> {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      );
    }

    // Verify with Privy API
    const verifyRes = await fetch('https://auth.privy.io/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!verifyRes.ok) {
      throw new Error('Invalid token');
    }

    // Get user info
    const userRes = await fetch('https://auth.privy.io/api/v1/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userData = await userRes.json();

    return NextResponse.json({
      success: true,
      user: {
        id: userData.sub,
        wallet: userData.wallet?.address,
        email: userData.email?.address,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      },
      { status: 401 }
    );
  }
}