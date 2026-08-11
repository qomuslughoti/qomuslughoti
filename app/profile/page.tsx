"use client";

import { useState, useEffect } from 'react';
import { User, Book, GraduationCap, MapPin, Phone, Building, Calendar } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PublicProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  
  const [profile, setProfile] = useState({
    nama: "Admin",
    nim: "-",
    jurusan: "-",
    fakultas: "-",
    angkatan: "-",
    alamat: "-",
    nomorTelepon: "-",
    fotoUrl: "",
  });

  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (profileData) {
        setProfile({
          nama: profileData.nama || "-",
          nim: profileData.nim || "-",
          jurusan: profileData.jurusan || "-",
          fakultas: profileData.fakultas || "-",
          angkatan: profileData.angkatan || "-",
          alamat: profileData.alamat || "-",
          nomorTelepon: profileData.nomor_telepon || "-",
          fotoUrl: profileData.foto_url || "",
        });

        const { data: eduData } = await supabase
          .from('education_history')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('tahun_masuk', { ascending: true });

        if (eduData) {
          setEducation(eduData.map(edu => ({
            id: edu.id,
            jenjang: edu.jenjang || "",
            namaSekolah: edu.nama_sekolah || "",
            tahunMasuk: edu.tahun_masuk || "",
            tahunLulus: edu.tahun_lulus || ""
          })));
        }
      }
    } catch (e) {
      console.error("Gagal mengambil data profil:", e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-2">
              <User className="w-8 h-8 text-primary" />
              Profil Penyusun
            </h1>
            <p className="text-text-muted mt-1">Biodata dan Riwayat Pendidikan</p>
          </div>
          <Link href="/" className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-gray-100 rounded-xl transition-colors">
            Kembali ke Kamus
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Biodata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                <div className="relative w-32 h-32 mb-4">
                  <div className="w-full h-full bg-primary-light rounded-full flex items-center justify-center text-primary border-4 border-white shadow-md overflow-hidden">
                    {profile.fotoUrl ? (
                      <img src={profile.fotoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16" />
                    )}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-text text-center">{profile.nama}</h2>
                <p className="text-primary font-medium mt-1">{profile.nim}</p>
              </div>

              <div className="pt-6 space-y-4">
                <h3 className="font-semibold text-text flex items-center gap-2 mb-4">
                  <Book className="w-4 h-4 text-primary" />
                  Detail Akademik
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs text-text-muted">Fakultas / Jurusan</p>
                      <p className="font-medium text-sm text-text">{profile.fakultas} / {profile.jurusan}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs text-text-muted">Angkatan</p>
                      <p className="font-medium text-sm text-text">{profile.angkatan}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs text-text-muted">Nomor Telepon</p>
                      <p className="font-medium text-sm text-text">{profile.nomorTelepon}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs text-text-muted">Alamat</p>
                      <p className="font-medium text-sm text-text leading-snug">{profile.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Education History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  Riwayat Pendidikan
                </h2>
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {education.map((edu) => (
                  <div key={edu.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-primary text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-gray-100 bg-gray-50/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-text">{edu.jenjang}</h3>
                        <span className="text-xs font-medium px-2.5 py-1 bg-white rounded-full text-text-muted border border-gray-100 shadow-sm">
                          {edu.tahunMasuk} - {edu.tahunLulus}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">{edu.namaSekolah}</p>
                    </div>
                  </div>
                ))}
                {education.length === 0 && (
                  <div className="text-center py-10 text-text-muted italic">
                    Belum ada riwayat pendidikan yang ditambahkan.
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
