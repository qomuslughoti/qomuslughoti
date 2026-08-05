import WordForm from '@/components/admin/WordForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewWordPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/dashboard" className="text-text-muted hover:text-primary flex items-center gap-2 font-bold mb-4 w-fit">
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-text">Tambah Kosakata Baru</h1>
        <p className="text-text-muted mt-2">Masukkan detail kata baru ke dalam kamus.</p>
      </div>

      <WordForm />
    </div>
  );
}
