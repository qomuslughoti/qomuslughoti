import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    const res = await fetch(targetUrl);
    
    if (!res.ok) throw new Error(`Failed to fetch from ${targetUrl}`);
    
    const buffer = await res.arrayBuffer();
    const headers = new Headers();
    const contentType = res.headers.get('content-type');
    
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    
    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy download error:', error);
    return new NextResponse('Error downloading file', { status: 500 });
  }
}
