# Absensi Mahasiswa — Next.js

Aplikasi absensi mahasiswa yang telah dimigrasikan dari Laravel/Blade ke Next.js App Router + TypeScript.

## Teknologi

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- MySQL
- QR Code
- HTML5 QR scanner

## Fitur

- Dashboard statistik mahasiswa, mata kuliah, jadwal, dan kehadiran.
- Daftar kehadiran dengan relasi mahasiswa, mata kuliah, dan jadwal.
- Form pembuatan data absensi.
- QR Code unik untuk data absensi.
- Pemindaian QR melalui kamera perangkat.
- Validasi relasi master data.
- Pencegahan data absensi ganda pada mahasiswa, jadwal, mata kuliah, dan tanggal yang sama.
- Seed data untuk pengujian.

## Menjalankan secara lokal

1. Install dependency:
   ```bash
   npm install
   ```

2. Buat file environment:
   ```bash
   cp .env.example .env
   ```

3. Isi `DATABASE_URL` dengan koneksi MySQL.

4. Buat/sinkronkan tabel Prisma:
   ```bash
   npx prisma db push
   ```

5. Isi data awal:
   ```bash
   npm run db:seed
   ```

6. Jalankan development server:
   ```bash
   npm run dev
   ```

7. Buka `http://localhost:3000`.

## Production

Project ini dirancang untuk deployment Next.js. Setelah database production tersedia, set `DATABASE_URL` pada environment deployment lalu jalankan build:

```bash
npm run build
npm start
```

Jangan commit file `.env` atau credential database ke repository.
