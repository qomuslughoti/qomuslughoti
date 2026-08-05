'use client';

import { useState } from 'react';
import { Word } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, X, Wand2 } from 'lucide-react';
import Image from 'next/image';

interface WordFormProps {
  initialData?: Word;
  isEdit?: boolean;
}

export default function WordForm({ initialData, isEdit }: WordFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    arabic_text: initialData?.arabic_text || '',
    meaning_id: initialData?.meaning_id || '',
    category: initialData?.category || '',
    example_sentence: initialData?.example_sentence || '',
    example_translation: initialData?.example_translation || '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // States for previews of generated content
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);

  const handleAutoGenerate = async () => {
    if (!formData.meaning_id) {
      alert("Masukkan Arti (Indonesia) terlebih dahulu!");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/generate?word=${encodeURIComponent(formData.meaning_id)}`);
      if (!res.ok) throw new Error("Gagal generate data AI");
      const data = await res.json();
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          arabic_text: data.data.arabic_text
        }));
        
        // Simpan URL preview
        setGeneratedImageUrl(data.data.image_url);
        if (data.data.image_url) setIsImageLoading(true);
        setGeneratedAudioUrl(data.data.audio_url);
        
        // Hapus file manual jika ada (prioritaskan yang digenerate)
        setImageFile(null);
        setAudioFile(null);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat men-generate data');
    } finally {
      setIsGenerating(false);
    }
  };

  const urlToFile = async (url: string, filename: string, mimeType: string): Promise<File> => {
    // Kita gunakan proxy agar terhindar dari error CORS
    const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: mimeType });
  };

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
      let final_audio_url = initialData?.audio_url;
      let final_image_url = initialData?.image_url;

      // Handle Image Upload
      if (imageFile) {
        const url = await handleFileUpload(imageFile, 'word-images');
        if (url) final_image_url = url;
      } else if (generatedImageUrl && !isEdit) {
        // Convert generated image URL to File and upload
        const file = await urlToFile(generatedImageUrl, 'generated-image.jpg', 'image/jpeg');
        const url = await handleFileUpload(file, 'word-images');
        if (url) final_image_url = url;
      }

      // Handle Audio Upload
      if (audioFile) {
        const url = await handleFileUpload(audioFile, 'word-audio');
        if (url) final_audio_url = url;
      } else if (generatedAudioUrl && !isEdit) {
         // Convert generated audio URL to File and upload
         const file = await urlToFile(generatedAudioUrl, 'generated-audio.mp3', 'audio/mpeg');
         const url = await handleFileUpload(file, 'word-audio');
         if (url) final_audio_url = url;
      }

      const wordPayload = {
        arabic_text: formData.arabic_text,
        meaning_id: formData.meaning_id,
        category: formData.category || null,
        example_sentence: formData.example_sentence || null,
        example_translation: formData.example_translation || null,
        audio_url: final_audio_url,
        image_url: final_image_url,
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-text">Arti (Indonesia) *</label>
              <button 
                type="button" 
                onClick={handleAutoGenerate}
                disabled={isGenerating || !formData.meaning_id}
                className="text-xs font-bold bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-yellow-500 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Isi Otomatis
              </button>
            </div>
            <input
              type="text"
              required
              value={formData.meaning_id}
              onChange={(e) => setFormData({ ...formData, meaning_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Buku"
            />
            <p className="text-xs text-gray-400 mt-1">Ketik bahasa Indonesia lalu klik "Isi Otomatis" untuk generate teks Arab, suara, & gambar.</p>
          </div>

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

        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-text mb-2">Gambar</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                setImageFile(e.target.files?.[0] || null);
                setGeneratedImageUrl(null); // hapus preview AI jika user upload manual
              }} 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm mb-2" 
            />
            
            {(generatedImageUrl || initialData?.image_url) && !imageFile && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                <img 
                  src={generatedImageUrl || initialData?.image_url || ''} 
                  alt="Preview" 
                  onLoad={() => setIsImageLoading(false)}
                  className={`object-cover w-full h-full transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                />
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                )}
                {generatedImageUrl && !isImageLoading && <span className="absolute bottom-1 right-1 bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold">AI Generated</span>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-text mb-2">File Audio</label>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={(e) => {
                setAudioFile(e.target.files?.[0] || null);
                setGeneratedAudioUrl(null); // hapus preview AI
              }} 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm mb-2" 
            />
            
            {(generatedAudioUrl || initialData?.audio_url) && !audioFile && (
              <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between">
                <audio controls src={generatedAudioUrl ? `/api/proxy-download?url=${encodeURIComponent(generatedAudioUrl)}` : (initialData?.audio_url || '')} className="h-8 w-full max-w-[200px]" />
                {generatedAudioUrl && <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">AI Generated</span>}
              </div>
            )}
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
