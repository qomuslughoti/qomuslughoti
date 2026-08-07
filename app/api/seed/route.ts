import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();

  const vocabulary = [
    { ar: 'قُبَّةٌ', id: 'kubah', cat: 'Masjid' },
    { ar: 'مُكَبِّرَةُ الصَّوْتِ', id: 'pengeras suara', cat: 'Masjid' },
    { ar: 'صَفٌّ', id: 'barisan atau shaf', cat: 'Masjid' },
    { ar: 'مَأْمُوْمٌ', id: 'seorang makmum', cat: 'Masjid' },
    { ar: 'إِمَامٌ', id: 'seorang imam atau pemimpin', cat: 'Masjid' },
    { ar: 'قُبَّةٌ', id: 'Kubah' },
    { ar: 'مُكَبِّرَةُ الصَّوْتِ', id: 'Pengeras suara' },
    { ar: 'صَفٌّ', id: 'Barisan atau shaf' },
    { ar: 'مَأْمُوْمٌ', id: 'Seorang makmum' },
    { ar: 'إِمَامٌ', id: 'Seorang imam atau pemimpin' },
    { ar: 'مُأَذِّنٌ', id: 'Orang yang mengumandangkan adzan' },
    { ar: 'تِلْمِيْذٌ', id: 'Murid laki-laki' },
    { ar: 'تِلْمِيْذَةٌ', id: 'Murid perempuan' },
    { ar: 'مَدْرَسَةٌ', id: 'Sekolah' },
    { ar: 'صَبَاحٌ', id: 'Pagi' },
    { ar: 'قَرِيْبٌ', id: 'Dekat' },
    { ar: 'أُسْتَاذٌ', id: 'Guru, pengajar, atau profesor' },
    { ar: 'صَوْتٌ', id: 'Suara' }, // Diperbaiki dari صَوْةٌ
    { ar: 'رَخِيْمٌ', id: 'Merdu' },
    { ar: 'جَارٌ ج جِيْرَانٌ', id: 'Tetangga' },
    { ar: 'وَرَاءَ', id: 'Di belakang' },
    { ar: 'أَمَامَ', id: 'Di depan' },
    { ar: 'أَبٌ', id: 'Ayah' },
    { ar: 'أُمٌّ', id: 'Ibu' },
    { ar: 'أَخٌ', id: 'Saudara laki-laki' },
    { ar: 'أُخْتٌ', id: 'Saudara perempuan' },
    { ar: 'خَاصٌ', id: 'Khusus' },
    { ar: 'نِسَاءٌ', id: 'Kaum perempuan' }
  ];

  const results = [];
  const pixabayKey = process.env.PIXABAY_API_KEY;

  for (const item of vocabulary) {
    try {
      // 1. Dapatkan terjemahan Inggris untuk cari gambar
      const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(item.id)}`);
      const enData = await enRes.json();
      const englishText = enData[0][0][0];

      // 2. Cari Gambar Pixabay
      let imageUrl = null;
      if (pixabayKey) {
        try {
          const pixabayRes = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(englishText)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`);
          if (pixabayRes.ok) {
            const pixabayData = await pixabayRes.json();
            if (pixabayData.hits && pixabayData.hits.length > 0) imageUrl = pixabayData.hits[0].webformatURL;
          }
        } catch (e) {}
      }

      // Fallback Wikipedia jika tidak ada gambar
      if (!imageUrl) {
        try {
          const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(englishText)}`);
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            imageUrl = wikiData.thumbnail?.source || wikiData.originalimage?.source || null;
          }
        } catch (e) {}
      }

      // 3. Audio URL
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(item.ar)}&tl=ar&client=tw-ob`;

      // 4. Insert ke Supabase
      const payload = {
        arabic_text: item.ar,
        meaning_id: item.id,
        category: "Kosa Kata Baru",
        image_url: imageUrl,
        audio_url: audioUrl
      };
      
      const { error } = await supabase.from('words').insert([payload]);
      if (!error) {
        results.push(`Sukses: ${item.id}`);
      } else {
        results.push(`Gagal DB (${item.id}): ${error.message}`);
      }
      
    } catch (e: any) {
      results.push(`Error Server (${item.id}): ${e.message}`);
    }
  }

  return NextResponse.json({ message: "Suntik data selesai", results });
}
