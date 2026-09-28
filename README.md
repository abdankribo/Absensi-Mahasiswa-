# Absensi Mahasiswa — Next.js

Sistem informasi absensi mahasiswa berbasis web yang digunakan untuk mengelola data akademik, jadwal perkuliahan, proses absensi, dan pemantauan kehadiran. Project ini merupakan hasil migrasi dari Laravel/Blade ke Next.js App Router dengan TypeScript dan Prisma.

## Gambaran Sistem

Sistem dirancang dengan tiga role utama:

- **ADMIN** — mengelola data akademik dalam lingkup fakultas.
- **DOSEN** — mengelola sesi absensi melalui QR Code dan memantau kehadiran mahasiswa.
- **MAHASISWA** — melakukan absensi dengan memindai QR Code sesi yang dibuat dosen.

Setiap akun diarahkan ke fitur sesuai role-nya. Data akademik juga dibatasi berdasarkan fakultas sehingga admin tidak mengelola data fakultas lain.

## Alur Kerja

```text
                         MULAI
                           │
                           ▼
                    ┌─────────────┐
                    │    LOGIN    │
                    └──────┬──────┘
                           │
                           ▼
                 Validasi akun & password
                           │
                           ▼
                    Pemeriksaan ROLE
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       ADMIN             DOSEN          MAHASISWA
          │                │                │
          ▼                ▼                ▼
   Kelola master      Buat sesi QR       Scan QR
   data akademik     untuk perkuliahan    absensi
          │                │                │
          │                ▼                ▼
          │          QR memiliki        Validasi
          │          identitas sesi      mahasiswa,
          │                │             jadwal &
          │                │             sesi
          │                │                │
          │                └────────┬───────┘
          │                         ▼
          │                 Simpan kehadiran
          │                         │
          └─────────────────────────┤
                                    ▼
                           Data kehadiran
                         dapat dipantau sistem
```

## Role dan Hak Akses

### 1. ADMIN

Admin merupakan pengelola data akademik pada fakultasnya.

Fungsi utama:

- Dashboard statistik sistem.
- Mengelola data mahasiswa.
- Mengelola data dosen.
- Mengelola mata kuliah.
- Mengelola kelas.
- Mengelola jadwal.
- Mengatur relasi dosen, mata kuliah, dan kelas.
- Mengubah data mahasiswa.
- Mengubah data dosen.
- Mengubah password mahasiswa.
- Mengubah password dosen.
- Melakukan navigasi langsung ke modul administrasi melalui dashboard.
- Mengimpor data mahasiswa dari Excel/CSV.
- Mengimpor data dosen dari Excel/CSV.
- Mengimpor data mata kuliah dari Excel/CSV.
- Mengimpor data jadwal dari Excel/CSV.
- Melihat data yang dibatasi berdasarkan fakultas admin.

### 2. DOSEN

Dosen berperan sebagai penyelenggara sesi absensi perkuliahan.

Fungsi utama:

- Melihat jadwal yang berkaitan dengan dosen.
- Membuat sesi absensi.
- Menghasilkan QR Code untuk sesi absensi.
- Menampilkan QR Code agar dapat dipindai mahasiswa.
- Memantau proses kehadiran.
- Melihat data mahasiswa yang telah melakukan absensi.
- Menggunakan data jadwal, mata kuliah, kelas, dan mahasiswa yang telah divalidasi sistem.

### 3. MAHASISWA

Mahasiswa menggunakan sistem untuk melakukan absensi pada sesi perkuliahan.

Fungsi utama:

- Login menggunakan NIM dan password.
- Melihat informasi akun.
- Memindai QR Code menggunakan kamera perangkat.
- Mengirim hasil pemindaian ke sistem.
- Mendapatkan validasi terhadap sesi absensi.
- Melihat daftar hadir milik akun mahasiswa sendiri.
- Tidak dapat membuat QR Code atau membuat absensi manual.
- Tidak dapat melihat daftar kehadiran mahasiswa lain.
- Mencegah absensi ganda pada sesi yang sama.

## Modul Utama

### Dashboard

Dashboard menyediakan ringkasan informasi sesuai role pengguna.

Informasi yang dapat ditampilkan meliputi:

- Jumlah mahasiswa.
- Jumlah dosen.
- Jumlah mata kuliah.
- Jumlah kelas.
- Informasi jadwal.
- Ringkasan kehadiran.
- Akses cepat ke modul administrasi untuk admin.

### Manajemen Mahasiswa

Admin dapat:

1. Menambahkan mahasiswa.
2. Menentukan NIM.
3. Menentukan nama mahasiswa.
4. Menentukan kelas.
5. Membuat password awal.
6. Mengubah data mahasiswa.
7. Mengubah password mahasiswa secara opsional.

Saat mengubah data mahasiswa, password dapat dikosongkan apabila password login tidak ingin diubah.

### Manajemen Dosen

Admin dapat:

1. Menambahkan dosen.
2. Menentukan NIDN.
3. Menentukan nama dosen.
4. Membuat password awal.
5. Mengubah data dosen.
6. Mengubah password dosen secara opsional.

### Manajemen Mata Kuliah

Admin dapat mengelola:

- Nama mata kuliah.
- Jumlah SKS.
- Data mata kuliah berdasarkan fakultas.

### Manajemen Kelas

Admin dapat mengelola:

- Kode kelas.
- Nama kelas.
- Keterkaitan kelas dengan mahasiswa dan jadwal.

### Manajemen Jadwal

Jadwal menghubungkan beberapa data akademik:

```text
Mata Kuliah
     │
     ├──────── Dosen
     │
     └──────── Kelas
                │
                ▼
             Jadwal
```

Data jadwal mencakup:

- Hari.
- Jam mulai.
- Jam selesai.
- Mata kuliah.
- Dosen.
- Kelas.

Sistem melakukan validasi relasi agar jadwal tidak menghubungkan data dari fakultas yang berbeda.

### Import Data Excel / CSV

Admin dapat menambahkan data master secara massal tanpa menginput satu per satu melalui form. Fitur tersedia pada tab **Mahasiswa**, **Dosen**, **Mata Kuliah**, dan **Jadwal**.

Format kolom yang didukung:

| Data | Kolom utama |
|---|---|
| Mahasiswa | `nim`, `nama`, `kelas`, `password` opsional |
| Dosen | `nidn`, `nama`, `password` opsional |
| Mata Kuliah | `namaMatakuliah` atau `nama_mata_kuliah`, `sks` |
| Jadwal | `hari`, `jamMulai`, `jamSelesai`, `matakuliah`, `nidn`, `kelas` |

File yang dapat digunakan adalah **.xlsx**, **.xls**, atau **.csv** dengan ukuran maksimal 5 MB. Untuk import jadwal, mata kuliah, dosen, dan kelas yang dirujuk harus sudah tersedia pada fakultas admin. Password mahasiswa dan dosen yang dikosongkan akan menggunakan password awal `12345678`, kemudian dapat diubah melalui manajemen data.

Setiap baris diproses secara terpisah. Jika ada baris yang gagal, sistem menampilkan nomor baris dan alasan kegagalannya sehingga data yang benar tetap dapat ditambahkan.

### Absensi QR Code

Alur absensi:

```text
DOSEN
  │
  ▼
Pilih/Buat sesi absensi
  │
  ▼
Sistem membuat QR Code
  │
  ▼
QR ditampilkan
  │
  ▼
MAHASISWA membuka scanner
  │
  ▼
Kamera memindai QR
  │
  ▼
Sistem memvalidasi sesi
  │
  ├── Tidak valid ──► Absensi ditolak
  │
  └── Valid ────────► Data kehadiran disimpan
```

Teknologi pemindaian menggunakan HTML5 QR scanner sehingga kamera perangkat dapat digunakan langsung dari browser yang mendukung akses kamera.

## Validasi dan Pencegahan Duplikasi

Sistem tidak hanya menerima hasil scan secara langsung. Data absensi terlebih dahulu divalidasi terhadap relasi akademik yang tersedia.

Validasi mencakup:

- Identitas mahasiswa.
- Identitas sesi absensi.
- Jadwal.
- Mata kuliah.
- Kelas.
- Dosen.
- Fakultas.
- Tanggal absensi.

Sistem juga mencegah mahasiswa mencatat absensi ganda untuk kombinasi mahasiswa, jadwal, mata kuliah, dan tanggal yang sama.

## Struktur Teknologi

```text
Browser
   │
   ▼
Next.js App Router
   │
   ├── UI / Dashboard
   ├── Authentication
   ├── Role Authorization
   ├── Admin Management
   ├── QR Generator
   ├── QR Scanner
   └── API / Server Logic
           │
           ▼
        Prisma ORM
           │
           ▼
          MySQL
```

### Teknologi yang digunakan

| Teknologi | Kegunaan |
|---|---|
| Next.js | Framework aplikasi web |
| React | Pembangunan antarmuka |
| TypeScript | Type safety |
| Prisma ORM | Akses dan pengelolaan database |
| MySQL | Penyimpanan data |
| QR Code | Identifikasi sesi absensi |
| HTML5 QR Scanner | Pemindaian QR melalui kamera |

## Struktur Data Konseptual

Relasi utama sistem dapat digambarkan sebagai berikut:

```text
FACULTY
   │
   ├── ADMIN
   │
   ├── DOSEN
   │
   ├── MAHASISWA ─── KELAS
   │
   ├── MATA KULIAH
   │
   └── JADWAL
          │
          ├── DOSEN
          ├── MATA KULIAH
          └── KELAS
                │
                ▼
          SESI ABSENSI
                │
                ▼
            ABSENSI
                │
                ▼
           MAHASISWA
```

## Keamanan dan Otorisasi

Aplikasi menerapkan pembatasan akses berdasarkan role dan fakultas.

Contoh:

- Admin tidak dapat mengelola data fakultas lain.
- Endpoint administrasi memeriksa role admin sebelum melakukan perubahan.
- Data dosen dan mahasiswa dibatasi berdasarkan konteks fakultas.
- Password disimpan dalam bentuk hash, bukan plaintext.
- Password baru pada perubahan akun memiliki validasi panjang minimum.
- Relasi data akademik diperiksa sebelum disimpan.
- Data absensi diperiksa untuk mencegah duplikasi.

## Akun Demo / Seed

Akun berikut tersedia untuk pengujian berdasarkan seed project:

| Role | ID / Identifier | Password |
|---|---|---|
| ADMIN | `ADMINTEKNIK` | `TEKNIK` |
| DOSEN | `0123456789` | `Budi1234` |
| MAHASISWA | `20240002` | `Siti1234` |

> **Catatan:** akun di atas ditujukan untuk demo/pengujian. Gunakan credential yang berbeda untuk deployment production.

## Menjalankan Project Secara Lokal

### 1. Clone repository

```bash
git clone https://github.com/abdankribo/Absensi-Mahasiswa-.git
cd Absensi-Mahasiswa-
```

### 2. Install dependency

```bash
npm install
```

### 3. Konfigurasi environment

Salin file contoh environment:

```bash
cp .env.example .env
```

Kemudian isi:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
```

Jangan commit file `.env` atau credential database.

### 4. Sinkronkan database

```npx prisma db push
```

### 5. Jalankan seed

```bash
npm run db:seed
```

### 6. Jalankan development server

```bash
npm run dev
```

Buka:

```text
http://localhost:3000
```

## Build Production

Untuk memastikan project dapat dibangun:

```bash
npm run build
```

Untuk menjalankan hasil build:

```bash
npm start
```

## Deployment

Project dapat digunakan pada platform yang mendukung Next.js dan MySQL.

Environment variable minimum yang perlu tersedia:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
```

Setelah database production tersedia:

```bash
npx prisma db push
npm run db:seed
npm run build
npm start
```

Untuk production, gunakan database dan password yang aman serta jangan menggunakan akun demo sebagai akun operasional.

## Autentikasi dan Logout

Sistem menggunakan sesi autentikasi untuk menjaga akses pengguna setelah berhasil login. Setelah autentikasi berhasil, pengguna diarahkan ke dashboard sesuai role:

```text
LOGIN
  │
  ▼
Validasi identifier & password
  │
  ▼
Pembuatan sesi autentikasi
  │
  ▼
Pemeriksaan ROLE
  ├── ADMIN       → /admin
  ├── DOSEN       → /dosen
  └── MAHASISWA   → /mahasiswa
```

Halaman login dibuat khusus untuk autentikasi dan tidak menampilkan menu Beranda atau Daftar Hadir. Setelah berhasil login, pengguna baru mendapatkan navigasi sesuai role.

Setiap pengguna yang sudah login memiliki informasi akun dan tombol **Logout** pada area navigasi aplikasi.

Proses logout:

```text
Pengguna menekan Logout
        │
        ▼
POST /api/auth/logout
        │
        ▼
Sesi autentikasi dihapus
        │
        ▼
Pengguna diarahkan ke /login
```

Fitur logout berlaku untuk seluruh role:

- ADMIN dapat mengakhiri sesi dari dashboard administrasi.
- DOSEN dapat mengakhiri sesi dari dashboard dosen.
- MAHASISWA dapat mengakhiri sesi dari dashboard mahasiswa.
- Tombol logout memiliki status proses agar tidak menjalankan permintaan berulang ketika sedang diproses.
- Setelah sesi dihapus, halaman yang membutuhkan autentikasi tidak dapat digunakan tanpa login kembali.


## Checklist Fungsional

- [x] Migrasi Laravel/Blade ke Next.js.
- [x] Next.js App Router.
- [x] TypeScript.
- [x] Prisma ORM.
- [x] MySQL.
- [x] Multi-role ADMIN, DOSEN, dan MAHASISWA.
- [x] Logout dari seluruh akun melalui sesi autentikasi.
- [x] Redirect kembali ke halaman login setelah logout.
- [x] Proteksi halaman berdasarkan sesi dan role pengguna.
- [x] Pembatasan data berdasarkan fakultas.
- [x] Dashboard admin.
- [x] Manajemen mahasiswa.
- [x] Manajemen dosen.
- [x] Manajemen mata kuliah.
- [x] Manajemen kelas.
- [x] Manajemen jadwal.
- [x] Import mahasiswa dari Excel/CSV.
- [x] Import dosen dari Excel/CSV.
- [x] Import mata kuliah dari Excel/CSV.
- [x] Import jadwal dari Excel/CSV.
- [x] Daftar hadir mahasiswa hanya menampilkan kehadiran akun sendiri.
- [x] Mahasiswa hanya dapat melakukan absensi melalui scan QR.
- [x] Perubahan password mahasiswa oleh admin.
- [x] Perubahan password dosen oleh admin.
- [x] QR Code sesi absensi.
- [x] QR scanner melalui kamera.
- [x] Validasi relasi absensi.
- [x] Pencegahan absensi ganda.
- [x] Seed data untuk pengujian.
- [x] Dokumentasi akun demo.

## Catatan Pengembangan

Project ini menggunakan data seed untuk mempermudah pengujian. Pada deployment production, data demo sebaiknya diganti atau dihapus dan credential default tidak digunakan.

