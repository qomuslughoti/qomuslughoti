'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Word } from '@/lib/types';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('words').select('*').order('created_at', { ascending: false });

    if (data) setWords(data as Word[]);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kata ini?')) return;

    await supabase.from('words').delete().eq('id', id);
    setWords(words.filter((w) => w.id !== id));
  };

  const filteredWords = words.filter((w) => w.arabic_text.includes(search) || w.meaning_id.toLowerCase().includes(search.toLowerCase()) || (w.category && w.category.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">Daftar Kata</h1>
          <p className="text-text-muted">Kelola kosakata bahasa Arab di kamus Anda.</p>
        </div>
        <Link href="/admin/words/new" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          Tambah Kata
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari Arab, arti, atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-text-muted text-sm uppercase tracking-wider">
                <th className="p-4 font-bold">Kata (Arab)</th>
                <th className="p-4 font-bold">Arti</th>
                {/* <th className="p-4 font-bold">Kategori</th> */}
                <th className="p-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    Loading data...
                  </td>
                </tr>
              ) : filteredWords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    Belum ada data kata.
                  </td>
                </tr>
              ) : (
                filteredWords.map((word) => (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={word.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">y
                      <span className="font-arabic text-2xl text-primary" dir="rtl">
                        {word.arabic_text}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-text">{word.meaning_id}</td>
                    <td className="p-4">{word.category ? <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{word.category}</span> : <span className="text-gray-300">-</span>}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/words/${word.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Pencil className="w-5 h-5" />
                        </Link>
                        <button onClick={() => handleDelete(word.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
