# Full Handover Proyek Web Absen

Dokumen ini adalah handover terbaru yang sudah disesuaikan dengan **isi file project saat ini** di:

`C:\Users\ahmad\Documents\project_absen`

AI lain sebaiknya membaca dokumen ini terlebih dahulu, lalu membaca file kode utama yang disebutkan di bawah agar konteks dan kode aktual tetap nyambung.

## 1. Tujuan Proyek

User sedang membuat **web absen sederhana** dengan tujuan utama:

- login user
- data user tersimpan di database
- absensi harian
- rekap / riwayat absensi

Pilihan login yang dipakai saat ini:

- `Google Auth` melalui Supabase

Login nomor HP sempat dibahas, tetapi **belum dikerjakan** dan ditunda ke fase berikutnya.

## 2. Stack yang Dipakai

Project ini memakai:

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `Supabase`
  - Auth
  - Postgres database

## 3. Lokasi Project

Project lokal berada di:

`C:\Users\ahmad\Documents\project_absen`

Command jalan lokal:

```powershell
npm run dev
```

URL lokal:

- `http://localhost:3000`

## 4. Status Setup Inti

Yang sudah selesai:

- project Supabase sudah dibuat
- Google OAuth sudah dihubungkan ke Supabase
- login Google sudah berhasil
- callback auth sudah berhasil
- session login tersimpan
- `.env.local` sudah dibuat dan dipakai

Environment variable yang dipakai:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 5. Database yang Sudah Ada

Sudah ada tabel:

- `profiles`
- `attendance`

Isi konsep tabel:

### `profiles`

- `id`
- `full_name`
- `phone`
- `role`
- `is_active`
- `created_at`

### `attendance`

- `id`
- `user_id`
- `attendance_date`
- `check_in`
- `check_out`
- `status`
- `note`
- `created_at`

## 6. Security dan Aturan Database

Sudah dilakukan:

- `RLS` aktif
- policy dasar untuk profile dan attendance user sendiri sudah dibuat
- trigger auto-create profile untuk user baru sudah dibuat
- unique constraint attendance harian sudah dibuat

Constraint penting:

- satu user hanya boleh punya **satu** attendance record per tanggal
- kombinasi unik:
  - `user_id + attendance_date`

## 7. File Penting yang Ada Sekarang

File inti project saat ini:

- `C:\Users\ahmad\Documents\project_absen\src\app\layout.tsx`
- `C:\Users\ahmad\Documents\project_absen\src\app\page.tsx`
- `C:\Users\ahmad\Documents\project_absen\src\app\settings\page.tsx`
- `C:\Users\ahmad\Documents\project_absen\src\app\riwayat\page.tsx`
- `C:\Users\ahmad\Documents\project_absen\src\app\laporan\page.tsx`
- `C:\Users\ahmad\Documents\project_absen\src\app\auth\callback\route.ts`
- `C:\Users\ahmad\Documents\project_absen\src\components\theme-provider.tsx`
- `C:\Users\ahmad\Documents\project_absen\src\lib\supabase.ts`
- `C:\Users\ahmad\Documents\project_absen\src\lib\server.ts`

## 8. Auth dan Theme Global Sudah Terpasang

### Auth

Auth flow sudah bekerja:

1. user klik login Google
2. diarahkan ke Google
3. kembali ke app
4. session aktif

### Theme global

**Penting:** dark/light theme global **sudah jadi**, bukan lagi rencana.

Ini dibuktikan oleh:

- `src/components/theme-provider.tsx` sudah ada
- `src/app/layout.tsx` sudah membungkus app dengan `ThemeProvider`
- `src/app/page.tsx` memakai `useTheme()`
- `src/app/settings/page.tsx` memakai `useTheme()`
- `src/app/riwayat/page.tsx` memakai `useTheme()`
- `src/app/laporan/page.tsx` memakai `useTheme()`

Perilaku theme sekarang:

- pilihan tema disimpan di `localStorage` dengan key `app-theme`
- class `dark` ditoggle di `document.documentElement`
- tema dark/light berlaku lintas halaman utama

## 9. Ringkasan Isi File `src/components/theme-provider.tsx`

Provider global sudah ada dengan konsep:

- state `theme: "light" | "dark"`
- helper `setTheme`
- boolean `isDark`
- hook `useTheme()`

Saat mount:

- membaca `app-theme` dari localStorage
- menerapkan class `dark` bila perlu

## 10. Ringkasan Isi File `src/app/layout.tsx`

Layout saat ini:

- import `ThemeProvider`
- membungkus seluruh aplikasi dalam `ThemeProvider`

Artinya dark mode bukan fitur lokal halaman settings lagi, tapi memang global app state.

## 11. Ringkasan Halaman Dashboard Utama

File:

- `src/app/page.tsx`

Kondisi dashboard utama saat ini:

- sudah memakai dark/light global
- ada login screen jika belum login
- ada dashboard jika sudah login

Fitur yang ada di dashboard utama:

- fetch current user
- fetch attendance hari ini
- fetch history 7 data terakhir
- check in
- check out
- logout
- navbar
- dropdown user kanan atas
- link ke:
  - `/settings`
  - `/riwayat`
  - `/laporan`

State utama di dashboard:

- `user`
- `message`
- `todayAttendance`
- `history`
- `loading`
- `dropdownOpen`

Komponen visual utama di dashboard:

- profile card kiri
- ringkasan kehadiran mingguan
- kontrol absensi hari ini
- weekly attendance trends
- hero/info card

Logika absensi dashboard saat ini:

- `Check In` disabled jika `todayAttendance` sudah ada
- `Check Out` disabled jika belum check in atau sudah check out
- setelah check in/check out, dashboard refetch data hari ini dan history

Catatan:
- dashboard menghitung `weeklyPercent` dari hasil `getLast7Days()`
- `history` sudah diambil, tapi di dashboard utama hanya dipakai untuk trend mingguan, bukan tabel detail

## 12. Ringkasan Halaman Settings

File:

- `src/app/settings/page.tsx`

Halaman settings saat ini cukup matang.

Fitur yang ada:

- dark/light theme global
- edit nama user
- profile summary card
- preferensi aplikasi
- logout

State utama:

- `user`
- `loading`
- `editName`
- `saving`
- `themeOpen`
- `saveMsg`

Fitur edit nama:

- update `profiles.full_name`
- update auth metadata `full_name`
- tombol simpan disabled bila nama tidak berubah
- ada feedback sukses/gagal

Fitur tema:

- popup kecil untuk pilih `Light` atau `Dark`
- opsi aktif diberi centang
- opsi aktif tidak bisa dipilih lagi
- perubahan tema memakai `setTheme()` dari provider global

## 13. Ringkasan Halaman Riwayat

File:

- `src/app/riwayat/page.tsx`

Halaman riwayat **sudah benar-benar ada dan berfungsi**, bukan placeholder.

Fitur yang ada:

- fetch data attendance user per bulan
- filter bulan
- filter tahun
- cari tanggal spesifik
- reset filter tanggal
- statistik ringkas:
  - total hadir
  - total tidak hadir
  - persentase hadir
- tabel riwayat attendance

State utama:

- `user`
- `records`
- `filtered`
- `loading`
- `selectedMonth`
- `selectedYear`
- `searchDate`

Tampilan data:

- tanggal
- check in
- check out
- status

Status badge yang sudah ada:

- `Hadir`
- `Telat`
- `Tidak Hadir`

Catatan teknis penting:

- halaman ini menampilkan data dari tabel `attendance`
- logika `Tidak Hadir` di sini lebih berupa kondisi record tanpa `check_in`, bukan perhitungan penuh hari kerja yang kosong seperti di laporan

## 14. Ringkasan Halaman Laporan

File:

- `src/app/laporan/page.tsx`

Halaman laporan **sudah ada dan lebih dari sekadar placeholder**.

Fitur yang ada:

- filter bulan
- filter tahun
- statistik bulanan:
  - total hadir
  - total absen
  - total telat
  - total jam kerja
- grafik kehadiran per minggu
- daftar hari kerja yang tidak hadir
- karakter/mood visual yang berubah sesuai jumlah hadir

Komponen internal yang ada:

- `MoodCharacter`
- `BarChart`

State utama:

- `user`
- `records`
- `loading`
- `selectedMonth`
- `selectedYear`

Perhitungan penting:

- total hadir berdasarkan record yang punya `check_in`
- total telat berdasarkan `status === "late"`
- total jam kerja dihitung dari selisih `check_in` dan `check_out`
- daftar tidak hadir dihitung dari hari kerja Senin-Jumat yang tidak punya record attendance di bulan tersebut

Catatan penting:
- halaman laporan saat ini **berfokus pada laporan user sendiri**, bukan admin seluruh user

## 15. Hal yang Sudah Lebih Maju dari Handover Lama

Dibanding handover lama, kondisi project sekarang sudah lebih maju karena:

- theme global sudah benar-benar terpasang
- halaman `riwayat` sudah dibuat dan berfungsi
- halaman `laporan` sudah dibuat dan berfungsi
- link navbar dashboard ke `riwayat` dan `laporan` sudah aktif
- settings sudah matang dan mendukung edit nama + theme switch

Jadi handover lama yang menyebut theme masih setengah jalan **sudah tidak akurat lagi**.

## 16. Hal yang Masih Kurang / Belum Selesai

Walau project sudah maju, beberapa hal inti web absen masih bisa dikembangkan:

- admin dashboard belum ada
- laporan untuk semua user belum ada
- role admin vs employee belum dipakai nyata di UI
- tombol `Edit Profil` di dropdown dashboard masih belum hidup
- tombol `Bantuan` di dropdown dashboard masih belum hidup
- dashboard utama belum menampilkan tabel/detail riwayat penuh
- status `late` belum terlihat punya logika backend/front-end yang benar-benar otomatis saat check in
- total jam kerja bulanan di dashboard utama masih placeholder `-`

## 17. Potensi Ketidaksinkronan yang Perlu Diperhatikan

AI berikutnya perlu memperhatikan beberapa hal ini:

1. Dashboard utama mengambil nama dari auth metadata, bukan langsung dari tabel `profiles`
2. Edit nama di settings mengupdate dua tempat:
   - `profiles`
   - auth metadata
3. Attendance status `late` sudah dipakai di tampilan `riwayat` dan `laporan`, tetapi belum jelas apakah logika check-in sekarang benar-benar mengisi `late`
4. Halaman laporan menghitung hari tidak hadir berdasarkan tidak adanya record attendance di hari kerja

## 18. Gaya User dan Cara Mendampingi

User lebih nyaman dengan:

- bahasa Indonesia santai
- arahan yang konkret
- langkah demi langkah
- penjelasan file/folder yang spesifik
- kadang lebih suka diberikan **isi penuh file**

User bisa bingung pada detail operasional seperti:

- file harus dibuat di folder mana
- file mana yang harus diubah
- cara membedakan beberapa `page.tsx`

Jadi AI berikutnya sebaiknya:

- jangan terlalu abstrak
- beri instruksi yang tajam dan spesifik
- bila menyuruh ubah kode, sering kali lebih enak memberi file lengkap

## 19. Prioritas Fitur yang Paling Masuk Akal Selanjutnya

Karena UI utama sudah cukup bagus, fokus berikutnya sebaiknya kembali ke tujuan utama web absen.

Urutan yang paling masuk akal:

1. admin dashboard sederhana
   - lihat semua absensi
   - filter tanggal
   - lihat nama, check in, check out, status

2. rapikan logika status absensi
   - hadir
   - telat
   - belum check in
   - sudah check out

3. hidupkan menu dropdown yang belum aktif
   - `Edit Profil`
   - `Bantuan`

4. sinkronkan/rapikan sumber data user
   - auth metadata vs profiles

5. tambahkan rekap yang lebih nyata di dashboard utama

## 20. File yang Sebaiknya Dibaca Dulu Oleh AI Berikutnya

Jika AI berikutnya ingin melanjutkan dengan aman, baca file ini dulu:

- `src/app/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/riwayat/page.tsx`
- `src/app/laporan/page.tsx`
- `src/app/layout.tsx`
- `src/components/theme-provider.tsx`
- `src/lib/supabase.ts`
- `src/lib/server.ts`
- `src/app/auth/callback/route.ts`

## 21. Ringkasan Super Padat

- Project: web absen sederhana
- Stack: Next.js + Tailwind + Supabase
- Google login: sudah jalan
- Database: `profiles` dan `attendance` sudah ada
- RLS: aktif
- Trigger auto-create profile: ada
- Unique attendance harian: ada
- Dashboard utama: sudah modern, ada check in/check out, navbar, dropdown
- Settings: sudah matang, bisa edit nama
- Riwayat: sudah ada dan berfungsi
- Laporan: sudah ada dan berfungsi
- Dark/light global: **sudah jadi**
- Belum ada admin dashboard
- Tujuan berikutnya paling logis: kembali ke fitur inti absensi dan admin

## 22. Pesan untuk AI Berikutnya

Jangan pakai handover lama yang menyebut theme global belum selesai.

Mulailah dengan asumsi:

- theme global sudah terpasang
- settings, riwayat, dan laporan sudah ada
- project sudah melampaui tahap MVP paling awal

Lalu lanjutkan dari fitur bisnis inti berikutnya, terutama:

- admin dashboard
- validasi status absensi
- pemakaian data attendance untuk rekap yang lebih lengkap

