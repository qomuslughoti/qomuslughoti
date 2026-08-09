'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, LayoutDashboard, Plus, Settings, User } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Don't show layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col p-4">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold text-primary">Qomus Admin</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <Link 
            href="/admin/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin/dashboard' 
                ? 'bg-primary-light text-primary font-bold' 
                : 'text-text-muted hover:bg-gray-100 hover:text-text'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/admin/words/new" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin/words/new' 
                ? 'bg-primary-light text-primary font-bold' 
                : 'text-text-muted hover:bg-gray-100 hover:text-text'
            }`}
          >
            <Plus className="w-5 h-5" />
            Tambah Kata
          </Link>
          <Link 
            href="/admin/profile" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              pathname === '/admin/profile' 
                ? 'bg-primary-light text-primary font-bold' 
                : 'text-text-muted hover:bg-gray-100 hover:text-text'
            }`}
          >
            <User className="w-5 h-5" />
            Profil Klien
          </Link>
        </nav>

        <div className="pt-4 border-t border-gray-100 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
