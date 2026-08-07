import { NextResponse } from 'next/server';

export async function GET() {
  const vocabulary = [
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
    { ar: 'صَوْتٌ', id: 'Suara' },
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

  const pixabayKey = process.env.PIXABAY_API_KEY;
  const processedData = [];

  for (const item of vocabulary) {
    let imageUrl = null;
    let audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(item.ar)}&tl=ar&client=tw-ob`;
    
    try {
      const enRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=id&tl=en&dt=t&q=${encodeURIComponent(item.id)}`);
      const enData = await enRes.json();
      const englishText = enData[0][0][0];

      if (pixabayKey) {
        try {
          const pixabayRes = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${encodeURIComponent(englishText)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=3`);
          if (pixabayRes.ok) {
            const pixabayData = await pixabayRes.json();
            if (pixabayData.hits && pixabayData.hits.length > 0) imageUrl = pixabayData.hits[0].webformatURL;
          }
        } catch (e) {}
      }

      if (!imageUrl) {
        try {
          const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(englishText)}`);
          if (wikiRes.ok) {
            const wikiData = await wikiRes.json();
            imageUrl = wikiData.thumbnail?.source || wikiData.originalimage?.source || null;
          }
        } catch (e) {}
      }
    } catch(e) {}

    processedData.push({
      ...item,
      imageUrl,
      audioUrl
    });
  }

  return NextResponse.json({ vocabulary: processedData });
}
