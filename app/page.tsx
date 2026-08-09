'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Word } from '@/lib/types';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import WordCard from '@/components/WordCard';
import WordDetailModal from '@/components/WordDetailModal';
import { BookOpen, LogIn, User } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const supabase = createClient();
  
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories (unique values from words table)
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('words')
        .select('category')
        .not('category', 'is', null);
        
      if (data) {
        const uniqueCategories = Array.from(new Set(data.map(item => item.category))).filter(Boolean) as string[];
        setCategories(uniqueCategories);
      }
    }
    fetchCategories();
  }, []);

  // Fetch words based on search and category
  useEffect(() => {
    async function fetchWords() {
      setIsLoading(true);
      let query = supabase.from('words').select('*').order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        // Simple search on meaning_id or arabic_text
        query = query.or(`meaning_id.ilike.%${searchQuery}%,arabic_text.ilike.%${searchQuery}%`);
      }

      // Limit for performance
      query = query.limit(20);

      const { data, error } = await query;
      
      if (data) {
        setWords(data as Word[]);
      }
      setIsLoading(false);
    }

    fetchWords();
  }, [searchQuery, selectedCategory]);

  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  };

  return (
    <main className="flex-1 flex flex-col items-center p-4 pt-12 sm:pt-20 pb-20 relative">
      
      {/* Top Right Navigation */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
        <Link 
          href="/admin/profile" 
          className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profil Klien</span>
        </Link>
        <Link 
          href="/admin/dashboard" 
          className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Login Admin</span>
        </Link>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-10 w-full">
          <div className="flex justify-center items-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="text-5xl sm:text-6xl font-bold text-primary font-arabic" dir="rtl">
              قاموس لغوي
            </h1>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">
            Qomus Lughoti
          </h2>
          <p className="text-text-muted">Kamus Digital Interaktif Bahasa Arab</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-8">
          <SearchBar onSearch={setSearchQuery} />
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}

        {/* Content Section */}
        <div className="w-full mt-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
            </div>
          ) : words.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {words.map((word) => (
                <WordCard 
                  key={word.id} 
                  word={word} 
                  onClick={handleWordClick} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-4">🐪</div>
              <h3 className="text-xl font-bold text-text mb-2">Kata tidak ditemukan</h3>
              <p className="text-text-muted">Coba cari dengan kata kunci lain atau hapus filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <WordDetailModal 
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}
