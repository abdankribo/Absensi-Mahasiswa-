# Absensi Mahasiswa — Next.js

Migrasi penuh dari Laravel/Blade ke Next.js App Router.

## Stack
- Next.js 16
- TypeScript
- Prisma
- MySQL
- QR Code
- QR scanner berbasis kamera

## Menjalankan
1. Salin `.env.example` menjadi `.env`.
2. Isi `DATABASE_URL`.
3. Jalankan `npm install`.
4. Jalankan `npx prisma db push`.
5. Jalankan `npm run db:seed`.
6. Jalankan `npm run dev`.

## Fitur
- Dashboard statistik.
- Daftar kehadiran.
- Pembuatan sesi absensi.
- QR Code unik untuk setiap data absensi.
- Pemindaian QR menggunakan kamera.
- Validasi relasi mahasiswa, mata kuliah, dan jadwal.
- Pencegahan absensi ganda pada jadwal yang sama di hari yang sama.
