'use client';

import WordForm from '@/components/admin/WordForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Word } from '@/lib/types';

export default function EditWordPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createClient();
  const [word, setWord] = useState<Word | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWord() {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(error);
        router.push('/admin/dashboard');
      } else {
        setWord(data as Word);
      }
      setIsLoading(false);
    }
    
    fetchWord();
  }, [id, router]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-text-muted hover:text-primary flex items-center gap-2 font-bold mb-4 w-fit">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-text">Edit Kosakata</h1>
        <p className="text-text-muted mt-2">Perbarui detail kata di dalam kamus.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 bg-white rounded-3xl border border-gray-100">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : word ? (
        <WordForm initialData={word} isEdit={true} />
      ) : null}
    </div>
  );
}
