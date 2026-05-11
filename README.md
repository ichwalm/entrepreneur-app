Platform Kewirausahaan berbasis Next.js (App Router) + MySQL (Prisma) + Tailwind CSS, dengan 2 role pengguna:
- `ADMIN`: login ke dashboard `/admin` untuk upload e-book, kelola produk, dan moderasi komentar
- `PUBLIC`: pengunjung bisa melihat konten tanpa login, login diperlukan untuk download e-book

## Menjalankan Lokal (Development)

### Prasyarat
- Node.js (disarankan LTS)
- MySQL (lokal atau remote)
- Akun Vercel (untuk Vercel Blob + deploy)

### 1) Install dependency
```bash
npm install
```

### 2) Set environment variables (lokal)
Buat file `.env.local` di root project (untuk Next.js):

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
NEXTAUTH_SECRET="isi-random-panjang"
NEXTAUTH_URL="http://localhost:3000"
BLOB_READ_WRITE_TOKEN="token-vercel-blob"
```

Catatan:
- `BLOB_READ_WRITE_TOKEN` dibutuhkan untuk upload e-book + gambar produk (karena storage pakai Vercel Blob).

Penting (Prisma):
- Prisma CLI membaca env dari file `.env` (atau `prisma/.env`), bukan `.env.local`.
- Agar perintah Prisma seperti `prisma generate` / `prisma db push` tidak error `Environment variable not found: DATABASE_URL`, pastikan `DATABASE_URL` juga ada di `.env` (root) atau `prisma/.env`.

### 3) Buat tabel database (Prisma)
```bash
npm run prisma:push
```

### 4) Jalankan dev server
```bash
npm run dev
```

Buka:
- Public: http://localhost:3000
- Admin: http://localhost:3000/admin (hanya role `ADMIN`)

## Membuat Akun Admin
1) Daftar akun lewat halaman `/register` (akun ini default `PUBLIC`)
2) Ubah role user jadi `ADMIN` di database MySQL:

```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'email-kamu@domain.com';
```

Lalu login lewat `/login`, akses dashboard: `/admin`.

## Production (Deploy ke Vercel)

### 1) Siapkan MySQL production
Gunakan MySQL yang bisa diakses dari Vercel (contoh: Railway, Aiven, PlanetScale, VPS).
Pastikan `DATABASE_URL` mengarah ke database production.

### 2) Buat project di Vercel & set Environment Variables
Di Vercel → Project Settings → Environment Variables, tambahkan:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` = URL production (contoh: `https://nama-project.vercel.app`)
- `BLOB_READ_WRITE_TOKEN`

### 3) Deploy
Hubungkan repo ke Vercel dan deploy seperti biasa. Aplikasi akan build menggunakan:
```bash
npm run build
```

### 4) Buat tabel di database production
Setelah env vars terpasang, jalankan sekali (bisa dari lokal dengan `DATABASE_URL` production):
```bash
npm run prisma:push
```

## Troubleshooting singkat
- Jika Prisma Client bermasalah setelah install (mis. setelah clone/deploy), jalankan:
  ```bash
  npm run postinstall
  ```
- Upload gagal: pastikan `BLOB_READ_WRITE_TOKEN` sudah benar dan project punya Vercel Blob Storage aktif.
