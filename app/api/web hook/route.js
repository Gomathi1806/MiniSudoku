import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Mini Sudoku Webhook Active",
    status: "working",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Farcaster webhook received:', body);
    
    return NextResponse.json({
      message: "Webhook received successfully",
      status: "ok"
    });
  } catch (error) {
    return NextResponse.json({
      error: "Invalid JSON"
    }, { status: 400 });
  }
}
