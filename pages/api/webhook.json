// pages/api/webhook.js (for Pages Router)
export default function handler(req, res) {
  if (req.method === 'POST') {
    // Handle Farcaster frame interactions
    console.log('Webhook received:', req.body);
    
    // Basic response for frame interactions
    res.status(200).json({
      message: "Webhook received successfully"
    });
  } else {
    // Handle GET requests
    res.status(200).json({
      name: "Mini Sudoku Webhook",
      status: "active"
    });
  }
}

// OR if using App Router, create: app/api/webhook/route.js
/*
import { NextResponse } from 'next/server';

export async function POST(request) {
  const body = await request.json();
  console.log('Webhook received:', body);
  
  return NextResponse.json({
    message: "Webhook received successfully"
  });
}

export async function GET() {
  return NextResponse.json({
    name: "Mini Sudoku Webhook", 
    status: "active"
  });
}
*/
