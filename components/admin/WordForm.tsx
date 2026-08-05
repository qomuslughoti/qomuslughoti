'use client';

import { useState } from 'react';
import { Word } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, X } from 'lucide-react';

interface WordFormProps {
  initialData?: Word;
  isEdit?: boolean;
}

export default function WordForm({ initialData, isEdit }: WordFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    arabic_text: initialData?.arabic_text || '',
    meaning_id: initialData?.meaning_id || '',
    category: initialData?.category || '',
    example_sentence: initialData?.example_sentence || '',
    example_translation: initialData?.example_translation || '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Storage logic is simplified for prototype.
  const handleFileUpload = async (file: File, bucket: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage.from(bucket).upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let audio_url = initialData?.audio_url;

      if (audioFile) {
        const url = await handleFileUpload(audioFile, 'word-audio');
        if (url) audio_url = url;
      }

      const wordPayload = {
        arabic_text: formData.arabic_text,
        meaning_id: formData.meaning_id,
        category: formData.category || null,
        example_sentence: formData.example_sentence || null,
        example_translation: formData.example_translation || null,
        audio_url,
      };

      if (isEdit && initialData) {
        const { error: updateError } = await supabase.from('words').update(wordPayload).eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('words').insert([wordPayload]);

        if (insertError) throw insertError;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10">
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-text mb-2">Kata Arab *</label>
            <input
              type="text"
              required
              value={formData.arabic_text}
              onChange={(e) => setFormData({ ...formData, arabic_text: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary font-arabic text-2xl"
              dir="rtl"
              placeholder="كِتَاب"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Arti (Indonesia) *</label>
            <input
              type="text"
              required
              value={formData.meaning_id}
              onChange={(e) => setFormData({ ...formData, meaning_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Buku"
            />
          </div>

          {/* <div>
            <label className="block text-sm font-bold text-text mb-2">Kategori</label>
            <input
              type="text"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="cth: Benda, Sekolah, Hewan"
            />
          </div> */}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-text mb-2">Contoh Kalimat (Arab)</label>
            <textarea
              rows={3}
              value={formData.example_sentence}
              onChange={(e) => setFormData({ ...formData, example_sentence: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary font-arabic text-xl"
              dir="rtl"
              placeholder="هَذَا كِتَابٌ جَدِيدٌ"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">Terjemahan Contoh</label>
            <textarea
              rows={2}
              value={formData.example_translation}
              onChange={(e) => setFormData({ ...formData, example_translation: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Ini adalah buku baru"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">File Audio</label>
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" />
            {initialData?.audio_url && !audioFile && <p className="text-xs text-green-600 mt-2 font-semibold">Audio sudah tersedia. Upload baru untuk mengganti.</p>}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-end gap-4 border-t border-gray-100 pt-6">
        <button type="button" onClick={() => router.back()} className="px-6 py-3 font-bold text-text-muted hover:bg-gray-100 rounded-xl transition-colors">
          Batal
        </button>
        <button type="submit" disabled={isLoading} className="px-8 py-3 font-bold bg-primary text-white hover:bg-primary-dark rounded-xl transition-colors flex items-center gap-2">
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          Simpan Kata
        </button>
      </div>
    </form>
  );
}
