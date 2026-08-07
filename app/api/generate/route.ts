import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  try {
    let normalizedWord = word.trim().toLowerCase();
    
    // Kamus Khusus untuk Kata Islam & Sehari-hari (Bisa ditambah)
    const customDictionary: Record<string, { ar: string, en: string }> = {
      'mushola': { ar: 'مُصَلَّى', en: 'prayer room' },
      'musholla': { ar: 'مُصَلَّى', en: 'prayer room' },
      'musala': { ar: 'مُصَلَّى', en: 'prayer room' },
      'mesjid': { ar: 'مَسْجِد', en: 'mosque' },
      'masjid': { ar: 'مَسْجِد', en: 'mosque' },
      'wudhu': { ar: 'وُضُوء', en: 'faucet water' },
      'wudu': { ar: 'وُضُوء', en: 'faucet water' },
      'sholat': { ar: 'صَلَاة', en: 'muslim prayer' },
      'salat': { ar: 'صَلَاة', en: 'muslim prayer' },
      'zakat': { ar: 'زَكَاة', en: 'charity' },
      'puasa': { ar: 'صَوْم', en: 'fasting' },
      'dzikir': { ar: 'ذِكْر', en: 'praying muslim' },
      'zikir': { ar: 'ذِكْر', en: 'praying muslim' },
      'tempat wudhu': { ar: 'مِيضَأَةٌ ج مَوَاضِئُ', en: 'mosque washing area' },
      'tempat wudu': { ar: 'مِيضَأَةٌ ج مَوَاضِئُ', en: 'mosque washing area' },
      'alquran': { ar: 'قُرْآن', en: 'quran book' },
      'al-quran': { ar: 'قُرْآن', en: 'quran book' },
      'quran': { ar: 'قُرْآن', en: 'quran book' }
    };

    let arabicText = '';
    let englishText = '';

    if (customDictionary[normalizedWord]) {
      arabicText = customDictionary[normalizedWord].ar;
      englishText = customDictionary[normalizedWord].en;
    } else {
      // 1. Fallback Translate Indo -> Arab
      const arabRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=ar&dt=t&q=${encodeURIComponent(normalizedWord)}`);
      const arabData = await arabRes.json();
      arabicText = arabData[0][0][0];

      // 2. Fallback Translate Indo -> Inggris (untuk prompt AI Image)
      const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(normalizedWord)}`);
      const enData = await enRes.json();
      englishText = enData[0][0][0];
    }

    // 3. Generate Audio URL (Google TTS)
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(arabicText)}&tl=ar&client=tw-ob`;

    // 4. Generate Image URL (Menggunakan Gambar Utama Wikipedia berdasarkan kata bahasa Inggris)
    // Ini jauh lebih akurat daripada Flickr dan lebih stabil daripada AI gratisan.
    let imageUrl = null;
    try {
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(englishText)}`, {
        headers: {
          'User-Agent': 'QomusLughoti/1.0 (https://qomuslughoti.vercel.app/)'
        }
      });
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        if (wikiData.thumbnail && wikiData.thumbnail.source) {
          imageUrl = wikiData.thumbnail.source;
        } else if (wikiData.originalimage && wikiData.originalimage.source) {
          imageUrl = wikiData.originalimage.source;
        }
      }
    } catch (e) {
      console.log("Wikipedia image not found, skipping.");
    }

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
