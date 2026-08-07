'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const supabase = createClient();

  const handleSeed = async () => {
    setLoading(true);
    setLogs(['Memulai proses suntik data...']);

    try {
      const response = await fetch('/api/seed_data');
      const data = await response.json();
      
      const vocabulary = data.vocabulary;
      let i = 1;
      
      for (const item of vocabulary) {
        setLogs(prev => [...prev, `[${i}/${vocabulary.length}] Sedang memproses: ${item.id}...`]);
        
        const payload = {
          arabic_text: item.ar,
          meaning_id: item.id,
          category: 'Kosa Kata Baru',
          image_url: item.imageUrl,
          audio_url: item.audioUrl
        };
        
        const { error } = await supabase.from('words').insert([payload]);
        
        if (error) {
          setLogs(prev => [...prev, `❌ Gagal: ${item.id} -> ${error.message}`]);
        } else {
          setLogs(prev => [...prev, `✅ Sukses: ${item.id}`]);
        }
        i++;
      }
      
      setLogs(prev => [...prev, '🎉 PROSES SUNTIK SELESAI! Silakan kembali ke Dashboard.']);
    } catch (e: any) {
      setLogs(prev => [...prev, `🚨 Error Fatal: ${e.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Mesin Suntik Massal (Admin Only)</h1>
      <p className="mb-6 text-gray-600">Klik tombol di bawah ini untuk memasukkan 23 data kosakata langsung ke dalam database dengan status login Anda.</p>
      
      <button 
        onClick={handleSeed}
        disabled={loading}
        className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-primary-dark transition disabled:opacity-50"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {loading ? 'Sedang Menyuntik...' : 'Mulai Suntik Data'}
      </button>

      <div className="mt-8 bg-gray-900 text-green-400 font-mono p-4 rounded-lg h-96 overflow-y-auto text-sm whitespace-pre-wrap">
        {logs.length === 0 ? '> Log proses akan muncul di sini...' : logs.join('\n')}
      </div>
    </div>
  );
}
