import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Ambil semua kata yang punya URL eksternal (bukan Supabase)
  const { data: words, error } = await supabase
    .from('words')
    .select('*')
    .or('image_url.not.ilike.%supabase.co%,audio_url.not.ilike.%supabase.co%');

  if (error || !words) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }

  const results = [];
  const pixabayKey = process.env.PIXABAY_API_KEY;

  for (const word of words) {
    let newImageUrl = word.image_url;
    let newAudioUrl = word.audio_url;
    let updated = false;

    try {
      // FIX IMAGE: Generate URL baru karena URL lama mungkin sudah kadaluarsa (anti-hotlink)
      if (word.image_url && !word.image_url.includes('supabase.co')) {
        let freshImageUrl = null;
        
        // Terjemahkan ke Inggris untuk Pixabay
        const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(word.meaning_id)}`);
        const enData = await enRes.json();
        const englishText = enData[0][0][0];

        // Cari di Pixabay
        if (pixabayKey) {
          try {
            const pixabayRes = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(englishText)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`);
            if (pixabayRes.ok) {
              const pixabayData = await pixabayRes.json();
              if (pixabayData.hits && pixabayData.hits.length > 0) freshImageUrl = pixabayData.hits[0].webformatURL;
            }
          } catch (e) {}
        }

        // Fallback Wikipedia
        if (!freshImageUrl) {
          try {
            const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(englishText)}`);
            if (wikiRes.ok) {
              const wikiData = await wikiRes.json();
              freshImageUrl = wikiData.thumbnail?.source || wikiData.originalimage?.source || null;
            }
          } catch (e) {}
        }

        // Download & Upload ke Supabase
        if (freshImageUrl) {
          const imageRes = await fetch(freshImageUrl);
          if (imageRes.ok) {
            const arrayBuffer = await imageRes.arrayBuffer();
            const ext = freshImageUrl.split('.').pop()?.split('?')[0] || 'jpg';
            const filename = `fixed_${word.id}_${Date.now()}.${ext}`;
            const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
            
            const { error: uploadErr } = await supabase.storage.from('word-images').upload(filename, arrayBuffer, {
              contentType,
            });
            if (!uploadErr) {
              const { data: { publicUrl } } = supabase.storage.from('word-images').getPublicUrl(filename);
              newImageUrl = publicUrl;
              updated = true;
            } else {
              console.error("Upload image error:", uploadErr);
            }
          }
        }
      }

      // FIX AUDIO: Google TTS URLs do not expire for browsers, but downloading them via server can be blocked or corrupted.
      // So we just re-generate the direct URL and save it.
      if (!word.audio_url || word.audio_url.includes('supabase.co')) {
        const freshAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word.arabic_text)}&tl=ar&client=tw-ob`;
        newAudioUrl = freshAudioUrl;
        updated = true;
      }

      // Update Database jika ada perubahan
      if (updated) {
        await supabase.from('words').update({
          image_url: newImageUrl,
          audio_url: newAudioUrl
        }).eq('id', word.id);
        results.push(`Sukses: ${word.meaning_id}`);
      }
    } catch (e: any) {
      results.push(`Gagal: ${word.meaning_id} - ${e.message}`);
    }
  }

  return NextResponse.json({ 
    message: 'Proses perbaikan aset selesai', 
    processed: results.length,
    results 
  });
}
