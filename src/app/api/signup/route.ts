import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // TODO: Implement actual database logic
    // For now, just return success
    return NextResponse.json(
      { message: 'User created successfully (mock)' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
