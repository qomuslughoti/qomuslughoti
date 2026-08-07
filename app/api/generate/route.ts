import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    let existingImageUrl = null;
    let existingAudioUrl = null;

    if (customDictionary[normalizedWord]) {
      arabicText = customDictionary[normalizedWord].ar;
      englishText = customDictionary[normalizedWord].en;
    } else {
      // 0. Cek Database: Apakah kata ini pernah diinput sebelumnya (dengan harakat)?
      // Ini membuat sistem "belajar" dari input manual user.
      const supabase = await createClient();
      const { data: existingWord } = await supabase
        .from('words')
        .select('arabic_text, image_url, audio_url')
        .ilike('meaning_id', normalizedWord)
        .limit(1)
        .single();

      if (existingWord) {
        arabicText = existingWord.arabic_text;
        existingImageUrl = existingWord.image_url;
        existingAudioUrl = existingWord.audio_url;
      }

      if (!arabicText) {
        // 1. Fallback Translate Indo -> Arab
        const arabRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=ar&dt=t&q=${encodeURIComponent(normalizedWord)}`);
        const arabData = await arabRes.json();
        arabicText = arabData[0][0][0];

        // 1.5 MAGIC: Coba cari Harakat dari Wiktionary Arab! (Ide brilian)
        try {
          const wikiRes = await fetch(`https://ar.wiktionary.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&titles=${encodeURIComponent(arabicText)}`);
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            const pages = wikiData.query?.pages;
            if (pages) {
              const pageId = Object.keys(pages)[0];
              const content = pages[pageId]?.revisions?.[0]?.slots?.main?.['*'];
              if (content) {
                if (content.includes('#تحويل') || content.includes('#REDIRECT')) {
                  const match = content.match(/\[\[(.*?)\]\]/);
                  if (match && match[1]) arabicText = match[1];
                } else {
                  // Coba cari teks tebal pertama yang memiliki tanda baca Arab (Harakat)
                  const match = content.match(/'''(.*?)'''/);
                  if (match && match[1] && /[\u064B-\u0652]/.test(match[1])) {
                    arabicText = match[1];
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log("Wiktionary harakat lookup failed", e);
        }
      }

      // 2. Fallback Translate Indo -> Inggris (selalu dijalankan untuk prompt gambar Pixabay)
      const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(normalizedWord)}`);
      const enData = await enRes.json();
      englishText = enData[0][0][0];
    }

    // 3. Generate Audio URL (Google TTS) atau gunakan yang sudah ada
    const audioUrl = existingAudioUrl || `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(arabicText)}&tl=ar&client=tw-ob`;

    // 4. Generate Image URL
    let imageUrl = null;
    
    // A. Coba gunakan Pixabay jika API key tersedia (Lebih bagus & estetik)
    const pixabayKey = process.env.PIXABAY_API_KEY;
    if (pixabayKey) {
      try {
        const pixabayRes = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(englishText)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`);
        if (pixabayRes.ok) {
          const pixabayData = await pixabayRes.json();
          if (pixabayData.hits && pixabayData.hits.length > 0) {
            // Ambil gambar pertama
            imageUrl = pixabayData.hits[0].webformatURL;
          }
        }
      } catch (e) {
        console.log("Pixabay API error, falling back to Wikipedia.");
      }
    }

    // B. Fallback ke Wikipedia jika Pixabay gagal atau tidak ada API Key
    if (!imageUrl) {
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
