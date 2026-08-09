"use client";

import { useState, useEffect } from 'react';
import { User, Book, GraduationCap, MapPin, Phone, Building, Calendar, Edit2, Check, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  
  // Default values
  const [profile, setProfile] = useState({
    id: "",
    nama: "",
    nim: "",
    jurusan: "",
    fakultas: "",
    angkatan: "",
    alamat: "",
    nomorTelepon: "",
  });

  const [education, setEducation] = useState<any[]>([]);

  // Form states for editing
  const [editProfile, setEditProfile] = useState(profile);
  const [editEducation, setEditEducation] = useState(education);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // Get the first profile (assuming single admin)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (profileData) {
        const loadedProfile = {
          id: profileData.id,
          nama: profileData.nama || "",
          nim: profileData.nim || "",
          jurusan: profileData.jurusan || "",
          fakultas: profileData.fakultas || "",
          angkatan: profileData.angkatan || "",
          alamat: profileData.alamat || "",
          nomorTelepon: profileData.nomor_telepon || "",
        };
        setProfile(loadedProfile);
        setEditProfile(loadedProfile);

        // Fetch education history
        const { data: eduData } = await supabase
          .from('education_history')
          .select('*')
          .eq('profile_id', profileData.id)
          .order('tahun_masuk', { ascending: true });

        if (eduData) {
          const loadedEducation = eduData.map(edu => ({
            id: edu.id,
            jenjang: edu.jenjang || "",
            namaSekolah: edu.nama_sekolah || "",
            tahunMasuk: edu.tahun_masuk || "",
            tahunLulus: edu.tahun_lulus || ""
          }));
          setEducation(loadedEducation);
          setEditEducation(loadedEducation);
        }
      } else {
        // If no profile exists, create a dummy state for the user to fill
        const initialProfile = {
          id: "",
          nama: "Admin",
          nim: "123456789",
          jurusan: "Teknik Informatika",
          fakultas: "Ilmu Komputer",
          angkatan: "2023",
          alamat: "Jakarta",
          nomorTelepon: "08123456789",
        };
        setProfile(initialProfile);
        setEditProfile(initialProfile);
      }
    } catch (e) {
      console.error("Gagal mengambil data profil:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editProfile.nama.trim() || !editProfile.nim.trim()) {
      alert("Nama dan NIM wajib diisi!");
      return;
    }
    
    setIsSaving(true);
    try {
      let profileId = profile.id;
      
      const profilePayload = {
        nama: editProfile.nama,
        nim: editProfile.nim,
        jurusan: editProfile.jurusan,
        fakultas: editProfile.fakultas,
        angkatan: editProfile.angkatan,
        alamat: editProfile.alamat,
        nomor_telepon: editProfile.nomorTelepon,
      };

      if (profileId) {
        // Update existing
        await supabase.from('profiles').update(profilePayload).eq('id', profileId);
      } else {
        // Insert new
        const { data, error } = await supabase.from('profiles').insert([profilePayload]).select().single();
        if (data) profileId = data.id;
      }

      // Handle Education History (Delete all and re-insert)
      if (profileId) {
        await supabase.from('education_history').delete().eq('profile_id', profileId);
        
        if (editEducation.length > 0) {
          const eduPayload = editEducation.map(edu => ({
            profile_id: profileId,
            jenjang: edu.jenjang,
            nama_sekolah: edu.namaSekolah,
            tahun_masuk: edu.tahunMasuk,
            tahun_lulus: edu.tahunLulus,
          }));
          await supabase.from('education_history').insert(eduPayload);
        }
      }
      
      await fetchProfileData();
      setIsEditing(false);
      alert("Profil berhasil disimpan!");
    } catch (e: any) {
      alert("Terjadi kesalahan saat menyimpan: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditProfile(profile);
    setEditEducation(education);
    setIsEditing(false);
  };

  const addEducation = () => {
    setEditEducation([
      ...editEducation,
      { id: Date.now().toString(), jenjang: "", namaSekolah: "", tahunMasuk: "", tahunLulus: "" }
    ]);
  };

  const removeEducation = (id: string) => {
    setEditEducation(editEducation.filter(edu => edu.id !== id));
  };

  const handleEducationChange = (id: string, field: string, value: string) => {
    setEditEducation(editEducation.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-2">
              <User className="w-8 h-8 text-primary" />
              Profil Mahasiswa
            </h1>
            <p className="text-text-muted mt-1">Kelola informasi biodata dan riwayat pendidikan Anda.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="px-4 py-2 text-sm font-medium text-text-muted hover:bg-gray-100 rounded-xl transition-colors">
              Kembali
            </Link>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profil
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-text text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent-2 text-white text-sm font-medium rounded-xl hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSaving ? (
                     <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Biodata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                <div className="w-32 h-32 bg-primary-light rounded-full flex items-center justify-center text-primary mb-4 border-4 border-white shadow-md">
                  <User className="w-16 h-16" />
                </div>
                {!isEditing ? (
                  <>
                    <h2 className="text-xl font-bold text-text text-center">{profile.nama}</h2>
                    <p className="text-primary font-medium mt-1">{profile.nim}</p>
                  </>
                ) : (
                  <div className="w-full space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">Nama Lengkap (Wajib)</label>
                      <input 
                        type="text" 
                        value={editProfile.nama}
                        onChange={(e) => setEditProfile({...editProfile, nama: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
                        placeholder="Masukkan nama"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">NIM (Wajib)</label>
                      <input 
                        type="text" 
                        value={editProfile.nim}
                        onChange={(e) => setEditProfile({...editProfile, nim: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center"
                        placeholder="Masukkan NIM"
                      />
                    </div>
                  </div>
                )}
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
                      {!isEditing ? (
                        <p className="font-medium text-sm text-text">{profile.fakultas} / {profile.jurusan}</p>
                      ) : (
                        <div className="flex gap-2 mt-1">
                          <input 
                            type="text" 
                            value={editProfile.fakultas}
                            onChange={(e) => setEditProfile({...editProfile, fakultas: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary"
                            placeholder="Fakultas"
                          />
                          <input 
                            type="text" 
                            value={editProfile.jurusan}
                            onChange={(e) => setEditProfile({...editProfile, jurusan: e.target.value})}
                            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary"
                            placeholder="Jurusan"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs text-text-muted">Angkatan</p>
                      {!isEditing ? (
                        <p className="font-medium text-sm text-text">{profile.angkatan}</p>
                      ) : (
                        <input 
                          type="text" 
                          value={editProfile.angkatan}
                          onChange={(e) => setEditProfile({...editProfile, angkatan: e.target.value})}
                          className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs text-text-muted">Nomor Telepon</p>
                      {!isEditing ? (
                        <p className="font-medium text-sm text-text">{profile.nomorTelepon}</p>
                      ) : (
                        <input 
                          type="text" 
                          value={editProfile.nomorTelepon}
                          onChange={(e) => setEditProfile({...editProfile, nomorTelepon: e.target.value})}
                          className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
                    <div className="w-full">
                      <p className="text-xs text-text-muted">Alamat</p>
                      {!isEditing ? (
                        <p className="font-medium text-sm text-text leading-snug">{profile.alamat}</p>
                      ) : (
                        <textarea 
                          value={editProfile.alamat}
                          onChange={(e) => setEditProfile({...editProfile, alamat: e.target.value})}
                          rows={3}
                          className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary resize-none"
                        />
                      )}
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
                {isEditing && (
                  <button 
                    onClick={addEducation}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary-dark text-xs font-medium rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  {education.map((edu, index) => (
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
              ) : (
                <div className="space-y-4">
                  {editEducation.map((edu, index) => (
                    <div key={edu.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50 relative group">
                      <button 
                        onClick={() => removeEducation(edu.id)}
                        className="absolute -top-3 -right-3 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3">
                          <label className="block text-xs font-medium text-text-muted mb-1">Jenjang</label>
                          <input 
                            type="text" 
                            value={edu.jenjang}
                            onChange={(e) => handleEducationChange(edu.id, 'jenjang', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            placeholder="SD / SMP / SMA"
                          />
                        </div>
                        <div className="md:col-span-5">
                          <label className="block text-xs font-medium text-text-muted mb-1">Nama Sekolah</label>
                          <input 
                            type="text" 
                            value={edu.namaSekolah}
                            onChange={(e) => handleEducationChange(edu.id, 'namaSekolah', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            placeholder="Contoh: SMAN 1 Jakarta"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-text-muted mb-1">Tahun Masuk</label>
                          <input 
                            type="text" 
                            value={edu.tahunMasuk}
                            onChange={(e) => handleEducationChange(edu.id, 'tahunMasuk', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            placeholder="YYYY"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-text-muted mb-1">Tahun Lulus</label>
                          <input 
                            type="text" 
                            value={edu.tahunLulus}
                            onChange={(e) => handleEducationChange(edu.id, 'tahunLulus', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            placeholder="YYYY"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {editEducation.length === 0 && (
                    <div className="text-center py-6 text-sm text-text-muted bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                      Belum ada data. Klik tambah untuk memasukkan riwayat pendidikan.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
