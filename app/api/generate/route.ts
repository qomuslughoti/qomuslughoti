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

    // 4. Generate Image URL (Mencari gambar gratis dari Flickr sebagai ganti AI yang sering error)
    const tags = englishText.trim().split(' ').join(',');
    const imageUrl = `https://loremflickr.com/512/512/${encodeURIComponent(tags)}`;

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
