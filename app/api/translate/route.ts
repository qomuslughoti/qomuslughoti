import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const sl = searchParams.get('sl') || 'ar';
  const tl = searchParams.get('tl') || 'id';

  if (!text) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`);
    if (!res.ok) throw new Error('Translation API failed');
    const data = await res.json();
    const translation = data[0][0][0];
    return NextResponse.json({ success: true, translation });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
