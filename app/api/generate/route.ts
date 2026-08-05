import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  try {
    // 1. Translate Indo -> Arab
    const arabRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=ar&dt=t&q=${encodeURIComponent(word)}`);
    const arabData = await arabRes.json();
    const arabicText = arabData[0][0][0];

    // 2. Translate Indo -> Inggris (untuk prompt AI Image)
    const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(word)}`);
    const enData = await enRes.json();
    const englishText = enData[0][0][0];

    // 3. Generate Audio URL (Google TTS)
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(arabicText)}&tl=ar&client=tw-ob`;

    // 4. Generate Image URL (Pollinations.ai)
    // Tambahkan prompt gaya visual agar cocok untuk aplikasi anak-anak
    const imagePrompt = `a cute colorful 3d icon of ${englishText}, isolated on pure white background, flat lighting, for kids app`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=512&height=512&nologo=true`;

    return NextResponse.json({
      success: true,
      data: {
        arabic_text: arabicText,
        audio_url: audioUrl,
        image_url: imageUrl,
      }
    });

  } catch (error: any) {
    console.error('Error generating AI data:', error);
    return NextResponse.json({ error: 'Gagal men-generate data dari server' }, { status: 500 });
  }
}
