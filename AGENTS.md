# AGENTS.md — Qomus Lughoti (قاموس لغوي)

Kamus digital Bahasa Arab. Dokumen ini adalah acuan teknis untuk siapapun (manusia atau AI agent) yang mengerjakan project ini.

## 1. Ringkasan Project

|                 |                                                                         |
| --------------- | ----------------------------------------------------------------------- |
| **Nama**        | Qomus Lughoti                                                           |
| **Target user** | Murid/siswa (belajar kosakata Arab)                                     |
| **Tipe**        | Kamus digital: publik (search & lihat kata) + admin (CRUD data)         |
| **Stack**       | Next.js (App Router) + Tailwind CSS + Supabase (DB, Auth, Storage)      |
| **Hosting**     | Vercel                                                                  |
| **Vibe desain** | Playful, modern, app-like (referensi: Duolingo) — bukan korporat/formal |
| **Data entry**  | Dilakukan oleh klien sendiri via halaman admin                          |

Scope sengaja simple: 1 tabel utama (`words`), auth standar Supabase, tanpa fitur linguistik kompleks (tanpa root/akar kata, tanpa harakat khusus, tanpa transliterasi) — cukup teks Arab + arti + audio.

---

## 2. Tech Stack & Alasan

- **Next.js 14+ (App Router)** — routing halaman publik & admin terpisah rapi, mudah deploy ke Vercel.
- **Tailwind CSS** — cepat untuk membangun UI playful dengan banyak custom component (card, badge, button animasi).
- **Supabase**
  - **Postgres DB** — tabel `words`.
  - **Supabase Auth** — login admin (email/password).
  - **Supabase Storage** — 2 bucket: `word-images`, `word-audio`.
- **Vercel** — hosting + auto deploy dari Git.
- **Framer Motion** (rekomendasi tambahan, ringan) — untuk micro-interaction (hover card, transisi modal, animasi search) supaya kesan "interactive" dapat.
- **lucide-react** — icon set konsisten, ringan.

---

## 3. Database Schema

### Tabel `words`

```sql
create table words (
  id uuid primary key default gen_random_uuid(),
  arabic_text text not null,          -- kata dalam huruf Arab, cth: كِتَاب
  meaning_id text not null,           -- arti dalam Bahasa Indonesia
  example_sentence text,              -- contoh kalimat (opsional, Arab)
  example_translation text,           -- terjemahan contoh kalimat (opsional)
  category text,                      -- kategori/tema, cth: "Kata Benda", "Sehari-hari" (untuk filter)
  image_url text,                     -- url dari Supabase Storage
  audio_url text,                     -- url dari Supabase Storage
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- index untuk search cepat
create index words_arabic_text_idx on words using gin (arabic_text gin_trgm_ops);
create index words_meaning_idx on words using gin (meaning_id gin_trgm_ops);
```

> Catatan: perlu extension `pg_trgm` untuk search fuzzy (`create extension if not exists pg_trgm;`). Kolom `category` disiapkan agar UI bisa punya filter chip ala Duolingo ("Semua", "Hewan", "Angka", dll) — meningkatkan kesan interactive tanpa nambah kompleksitas backend.

### Storage Buckets

- `word-images` — public read, authenticated write.
- `word-audio` — public read, authenticated write.

### RLS Policy (ringkas)

- `words` table: `select` public (anon boleh baca), `insert/update/delete` hanya role `authenticated`.
- Storage buckets: `select` public, `insert/update/delete` hanya `authenticated`.

---

## 4. Struktur Halaman

### Publik (`/`)

- **Landing/Search Page** (`/`)
  - Hero section dengan search bar besar (auto-focus, animasi placeholder bergilir contoh kata).
  - Grid/list "Kata Populer" atau "Kata Terbaru" saat search kosong — jangan biarkan halaman kosong melompong.
  - Filter chip kategori (scroll horizontal di mobile).
  - Card kata: tampilkan `arabic_text` besar + `meaning_id` + badge kategori. Klik → buka modal/detail.
- **Detail Kata** (modal atau `/kata/[id]`)
  - Teks Arab besar (font Arab yang jelas, cth: Amiri/Noto Naskh Arabic).
  - Arti, contoh kalimat + terjemahan.
  - Gambar (jika ada).
  - Audio player dengan tombol play besar & jelas (siswa butuh ini untuk belajar pelafalan).
  - Tombol share/copy (nice-to-have).

### Admin (`/admin`)

- `/admin/login` — form login (Supabase Auth email/password).
- `/admin/dashboard` — list semua kata (table/card), search, tombol tambah, edit, hapus.
- `/admin/words/new` & `/admin/words/[id]/edit` — form CRUD:
  - Input teks Arab, arti, contoh kalimat, kategori.
  - Upload gambar (preview sebelum submit).
  - Upload audio (preview/play sebelum submit).
  - Validasi field wajib (`arabic_text`, `meaning_id`).
- Proteksi: middleware Next.js redirect ke `/admin/login` jika belum auth.

---

## 5. Desain System — "Playful Modern, Duolingo-inspired"

### Prinsip

- Biru sebagai warna dasar, tapi **hidup** (bukan biru navy korporat) — pakai biru cerah/vibrant sebagai primary, dipadu warna aksen cerah lain untuk elemen gamifikasi.
- Rounded corners besar (`rounded-2xl`/`rounded-3xl`), shadow lembut, bukan garis tegas/kaku.
- Micro-interaction di hampir semua elemen interaktif: hover scale, tap bounce, transisi smooth.
- Ilustrasi/emoji/icon playful, bukan foto formal.
- Font Arab besar & jelas — ini kamus, keterbacaan huruf Arab nomor satu.

### Palet Warna (usulan awal, bisa disesuaikan dengan klien)

```
--primary:      #2563EB  (biru vibrant, tombol utama, header)
--primary-dark: #1E40AF  (hover state, teks penting)
--primary-light:#DBEAFE  (background card, badge)
--accent:       #FBBF24  (kuning, untuk highlight/gamifikasi — cth badge "baru")
--accent-2:     #34D399  (hijau, untuk state sukses/benar)
--bg:           #F8FAFC  (background utama, hampir putih)
--text:         #1E293B  (teks utama)
--text-muted:   #64748B
```

### Tipografi

- **Arab**: `Noto Naskh Arabic` atau `Amiri` (via Google Fonts) — ukuran besar (min 32px untuk kata utama).
- **Latin/UI**: `Poppins` atau `Nunito` — bulat, ramah, sesuai vibe Duolingo (bukan font formal seperti Inter/Roboto).

### Komponen kunci

- **Search bar**: rounded-full, shadow, icon kaca pembesar animasi saat fokus.
- **Word Card**: rounded-2xl, hover lift + shadow, warna background bergantian pastel biru/putih.
- **Category chip**: pill button, aktif = filled biru, non-aktif = outline.
- **Audio button**: bulat besar, animasi pulse saat playing.
- **Modal detail**: slide-up dari bawah (mobile) / fade+scale (desktop).
- **Empty/loading state**: jangan skeleton generic — pakai ilustrasi playful + teks ramah ("Yuk cari kata pertamamu!").

> Rekomendasi: sebelum full development, buat 1 halaman contoh (search + card + modal) dan tunjukkan ke klien untuk approve arah desain, biar tidak revisi besar di akhir.

---

## 6. Struktur Folder (Next.js App Router)

```
qomus-lughoti/
├── app/
│   ├── page.tsx                     # halaman publik (search)
│   ├── kata/[id]/page.tsx           # detail kata (opsional, jika tidak pakai modal)
│   ├── admin/
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── words/
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── SearchBar.tsx
│   ├── WordCard.tsx
│   ├── WordDetailModal.tsx
│   ├── CategoryFilter.tsx
│   ├── AudioPlayer.tsx
│   └── admin/
│       ├── WordForm.tsx
│       └── WordTable.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # supabase client (browser)
│   │   └── server.ts                # supabase client (server component)
│   └── types.ts                     # tipe TypeScript (Word, dll)
├── middleware.ts                    # proteksi route /admin
├── public/
├── .env.local                       # SUPABASE_URL, SUPABASE_ANON_KEY, dll
└── AGENTS.md
```

---

## 7. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

(Service role key TIDAK perlu di frontend — semua write lewat authenticated client + RLS.)

---

## 8. Roadmap Pengerjaan

### Tahap 1 — Setup & Database

- [ ] Buat email baru untuk akun project.
- [ ] Setup akun Supabase (project baru) + Vercel.
- [ ] Buat tabel `words` + RLS policy.
- [ ] Buat bucket storage `word-images` & `word-audio` + policy.
- [ ] Init project Next.js + Tailwind, setup font Arab & Poppins/Nunito.
- [ ] Setup Supabase client (browser & server).

### Tahap 2 — Fitur Utama & Admin

- [ ] Bangun halaman publik: search bar, grid kata, filter kategori, modal detail, audio player.
- [ ] Bangun sistem login admin (Supabase Auth) + middleware proteksi.
- [ ] Bangun form CRUD kata (create/edit/delete) + upload gambar & audio ke Storage.
- [ ] Styling penuh sesuai design system (playful, biru, rounded, micro-interaction).

### Tahap 3 — Testing, Deployment & Handover

- [ ] Klien input 3–5 data dummy lewat admin, cek alur data end-to-end.
- [ ] Test responsif di mobile & desktop, test audio playback di berbagai browser.
- [ ] Deploy ke Vercel.
- [ ] Kirim link publik + kredensial admin ke klien untuk uji coba.

---

## 9. Keputusan Desain yang Sudah Dikunci

- Login admin: **Supabase Auth (email/password)**.
- Fitur linguistik: **tidak ada** root/harakat/transliterasi khusus — cukup teks Arab, arti, contoh kalimat, gambar, audio.
- Arah visual: **playful/modern app-like (Duolingo-style)**, target audiens siswa, base warna biru vibrant.

## 10. Hal yang Masih Perlu Dikonfirmasi ke Klien

- Nama domain/subdomain untuk deploy (atau cukup domain default Vercel dulu?).
- Apakah perlu kategori/tema kata dari awal, atau semua kata "flat" tanpa kategori di versi pertama?
- Apakah butuh fitur "kata favorit"/bookmark untuk siswa (localStorage, tanpa perlu akun siswa)? — bagus untuk kesan interactive tapi belum masuk scope awal.
