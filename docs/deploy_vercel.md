# Deploy ke Vercel (Production)

Dokumen ini menjelaskan langkah deploy project **Wirausaha-App** ke **Vercel** dengan MySQL + Prisma + NextAuth.

Penting:
- Implementasi saat ini menyimpan file upload ke filesystem lokal (`uploads/` atau `UPLOAD_DIR`).
- Lingkungan serverless (termasuk Vercel) tidak menyediakan disk persisten untuk penyimpanan file upload.
- Agar fitur upload gambar & upload e-book tetap bekerja di Vercel, perlu migrasi storage ke layanan eksternal (mis. Vercel Blob / S3 / R2).

## Prasyarat

- Repo sudah ada di GitHub/GitLab/Bitbucket
- Database MySQL production yang bisa diakses dari internet (bukan MySQL lokal)
- Project Vercel

## 1) Siapkan Database MySQL Production

Gunakan penyedia MySQL yang bisa diakses dari Vercel (contoh: Railway, Aiven, PlanetScale, VPS).

Siapkan URL koneksi dengan format:

```txt
mysql://USER:PASSWORD@HOST:3306/DB_NAME
```

Pastikan:
- `HOST` bukan `localhost`
- user punya izin membuat tabel (untuk `prisma db push`)

## 2) Buat Project di Vercel

1. Login ke Vercel
2. Klik **Add New → Project**
3. Import repository kamu
4. Framework preset: **Next.js**

## 3) Set Environment Variables di Vercel

Masuk ke **Project Settings → Environment Variables**, lalu tambahkan:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
NEXTAUTH_SECRET="string-random-panjang"
NEXTAUTH_URL="https://domain-kamu.vercel.app"
```

Catatan:
- `DATABASE_URL` wajib agar Prisma bisa konek ke MySQL.
- `NEXTAUTH_SECRET` wajib untuk JWT/session.
- `NEXTAUTH_URL` harus URL production (kalau pakai domain custom, gunakan domain custom).

## 4) Deploy

Setelah env vars terpasang, lakukan deploy:
- Klik **Deploy** (untuk pertama kali), atau push commit baru untuk trigger deploy ulang.

Vercel akan menjalankan build (default):

```bash
npm run build
```

## 5) Buat/Update Tabel di Database (Prisma)

Setelah deploy dan env vars sudah benar, jalankan:

```bash
npm run prisma:push
```

Cara menjalankannya:
- Bisa dari lokal dengan `DATABASE_URL` yang mengarah ke DB production (di file `.env` root), atau
- Dari CI/CD kamu sendiri jika punya

Perintah ini akan membuat tabel sesuai schema Prisma di `prisma/schema.prisma`.

## 6) Membuat User Admin

Role default user baru adalah `PUBLIC`. Untuk membuat admin:

1) Daftar user via halaman `/register` di production
2) Update role di database:

```sql
UPDATE User SET role = 'ADMIN' WHERE email = 'email-kamu@domain.com';
```

Lalu login via `/login` dan akses dashboard `/admin`.

## 7) Verifikasi Setelah Deploy

Checklist cepat:
- Homepage bisa diakses tanpa login
- Produk detail menampilkan alamat (teks)
- Komentar bisa dikirim (status pending) dan muncul setelah admin approve
- Upload e-book dan gambar produk berhasil (cek Vercel Blob)
- Download e-book hanya bisa setelah login
- Route `/admin` tidak bisa dibuka oleh user non-admin

## 8) Catatan Penting: Upload di Vercel
Jika deploy ke Vercel tanpa storage eksternal:
- Upload gambar (product image / cover / banner) yang tersimpan ke `uploads/` tidak akan persisten.
- Upload e-book yang tersimpan ke `uploads/private/ebooks` juga tidak persisten.
- Gejala umum: file berhasil di-upload, tetapi hilang setelah redeploy / scale / cold start.

Solusi yang disarankan:
- Migrasikan implementasi upload ke storage eksternal (Vercel Blob/S3/R2), lalu simpan URL publik di database.
- Untuk e-book, simpan URL file yang diproteksi/bermasa-akses (signed URL) atau simpan link private lalu proxy download dengan auth.

## Troubleshooting

### A) Prisma error koneksi database
- Pastikan `DATABASE_URL` sudah benar di Vercel (Environment Variables).
- Pastikan DB mengizinkan koneksi dari internet dan firewall/security group terbuka untuk Vercel.

### B) Upload gagal (Blob)
Jika sudah migrasi ke storage eksternal:
- Pastikan token/credential storage sudah benar.
- Pastikan bucket/container dan permission sudah tepat.

### C) Login/redirect aneh
- Pastikan `NEXTAUTH_URL` sesuai domain yang benar (bukan localhost).
- Pastikan `NEXTAUTH_SECRET` terisi dan tidak berubah-ubah.
