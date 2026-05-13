Platform kewirausahaan berbasis Next.js (App Router) + MySQL (Prisma) + Tailwind CSS.

Fokus utama aplikasi:
- Katalog produk/UMKM (publik)
- Submit produk oleh user terdaftar (role `PUBLIC`) untuk diverifikasi admin
- Konten e-book (upload oleh admin; download hanya untuk user yang sudah login)
- Moderasi komentar produk oleh admin
- Manajemen konten pendukung (banner, tag, promo)

Role pengguna:
- `ADMIN`: akses dashboard `/admin` + semua endpoint `/api/admin/*`
- `PUBLIC`: akses konten publik, bisa daftar/login, submit produk, dan download e-book setelah login

## Tech Stack
- Next.js 16 (App Router) + React 19
- NextAuth (Credentials Provider, JWT session)
- Prisma ORM + MySQL
- Tailwind CSS v4 (via PostCSS)
- Zod (validasi input) + sanitize-html (sanitasi input)

## Struktur Project
Direktori penting:
- `src/app/*`: halaman (App Router) dan route handler API
  - `src/app/api/*`: API (Route Handlers)
  - `src/app/admin/*`: UI dashboard admin
  - `src/app/media/[type]/[file]/route.ts`: penyajian file gambar yang di-upload (covers/products/banners)
- `src/lib/*`: util inti (auth, prisma, validasi, sanitasi, rate-limit, storage)
- `prisma/schema.prisma`: schema database
- `uploads/`: root penyimpanan file lokal (default). Bisa dipindah via env `UPLOAD_DIR`
- `docs/*`: dokumentasi tambahan (deployment, dsb.)

## Menjalankan Lokal (Development)

### Prasyarat
- Node.js (disarankan LTS)
- MySQL (lokal atau remote)

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
UPLOAD_DIR="/path/ke/folder/uploads" # opsional
```

Catatan:
- `UPLOAD_DIR` opsional. Jika tidak diisi, aplikasi menyimpan file ke folder `./uploads` di root project.
- File yang di-upload dibagi menjadi:
  - Publik (gambar): `uploads/public/{covers,products,banners}/*` dan diakses via URL `/media/<type>/<file>`
  - Privat (e-book): `uploads/private/ebooks/*` dan diakses via `/api/ebooks/:id/download` (butuh login)

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

## Konfigurasi & Script
Script yang tersedia (lihat `package.json`):
- `npm run dev`: jalankan dev server
- `npm run build`: build production
- `npm run start`: jalankan server hasil build
- `npm run lint`: lint dengan ESLint
- `npm run prisma:generate`: generate Prisma Client
- `npm run prisma:push`: create/update tabel di database sesuai schema

Catatan Prisma (postinstall):
- Script `postinstall` menjalankan `prisma generate` dan melakukan penyesuaian symlink Prisma Client untuk environment tertentu.

## Storage (Upload) — Penting untuk Production
Implementasi saat ini menyimpan file ke filesystem lokal (folder `uploads/` atau `UPLOAD_DIR`).

Implikasi:
- Cocok untuk local development.
- Untuk production, butuh storage persisten (VPS dengan disk persisten, atau pindah ke object storage seperti S3/Vercel Blob).
- Deploy ke Vercel tanpa storage eksternal akan membuat file upload tidak persisten (bisa hilang saat cold start/redeploy/scale).

## Production (Deploy)
Panduan deployment ada di [deploy_vercel.md](file:///home/ichwal/Documents/trae_projects/Enterpreneur-App/docs/deploy_vercel.md).

Minimal environment variables (production):
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB_NAME"
NEXTAUTH_SECRET="string-random-panjang"
NEXTAUTH_URL="https://domain-kamu"
UPLOAD_DIR="/path/persisten/untuk/uploads" # jika pakai server dengan disk persisten
```

## API Reference (Ringkas)
Semua response error umumnya berbentuk:
```json
{ "error": "pesan error" }
```

Auth:
- Endpoint admin (`/api/admin/*`) diproteksi oleh `middleware.ts` dan mensyaratkan user login dengan role `ADMIN`.
- Endpoint download e-book mensyaratkan user login (role apa pun).

### Auth
**POST** `/api/register`
- Content-Type: `application/json`
- Body:
  - `name` (string, min 2)
  - `email` (string, email)
  - `password` (string, min 8)
- Response: `{ "ok": true }`

**GET/POST** `/api/auth/[...nextauth]`
- Endpoint NextAuth (Credentials Provider).

### Produk (Publik)
**POST** `/api/products/submit`
- Auth: wajib login, hanya role `PUBLIC`
- Content-Type: `multipart/form-data`
- Fields:
  - `title` (string)
  - `description` (string)
  - `descriptionHtml` (string, opsional; akan disanitasi)
  - `locationName` (string, opsional)
  - `category` (string, opsional)
  - `tags` (string, opsional; format: `"tag1, tag2, tag3"`)
  - `instagram` (string URL, opsional)
  - `whatsapp` (string, opsional)
  - `facebook` (string URL, opsional)
  - `images` (File[], opsional; jpg/png/webp, maks 5MB per file)
- Behavior: produk dibuat dengan `status=PENDING`
- Response: `{ "ok": true, "id": "<productId>" }`

**POST** `/api/products/:id/comments`
- Content-Type: `application/json`
- Body:
  - `authorName` (string)
  - `authorEmail` (string email, opsional)
  - `content` (string)
  - `parentId` (string, opsional; untuk reply)
- Behavior: komentar dibuat dengan `status=PENDING`
- Response: `{ "ok": true }`

### E-book (Download)
**GET** `/api/ebooks/:id/download`
- Auth: wajib login
- Behavior:
  - Jika `fileUrl` adalah URL `http(s)`, server akan redirect ke URL tersebut
  - Jika `fileUrl` adalah path relatif, server akan stream file dari folder `uploads/`

### Admin: Produk
**POST** `/api/admin/products`
- Auth: `ADMIN`
- Content-Type: `multipart/form-data`
- Fields sama dengan `/api/products/submit`, plus:
  - `isFeatured` (string `"true"`/`"false"`, opsional)
- Behavior: produk dibuat dengan `status=APPROVED`

**PATCH** `/api/admin/products/:id`
- Auth: `ADMIN`
- Content-Type: `multipart/form-data`
- Fields: sama seperti create (opsional ada `images` untuk menambah gambar)

**DELETE** `/api/admin/products/:id`
- Auth: `ADMIN`

**PATCH** `/api/admin/products/:id/status`
- Auth: `ADMIN`
- Content-Type: `application/json`
- Body: `{ "status": "PENDING" | "APPROVED" | "REJECTED" }`
- Catatan: jika status bukan `APPROVED`, `isFeatured` akan otomatis di-set `false`

### Admin: Komentar
**PATCH** `/api/admin/comments/:id`
- Auth: `ADMIN`
- Body: `{ "status": "APPROVED" | "REJECTED" }`

**DELETE** `/api/admin/comments/:id`
- Auth: `ADMIN`

### Admin: E-book
**POST** `/api/admin/ebooks`
- Auth: `ADMIN`
- Content-Type: `multipart/form-data`
- Fields:
  - `title`, `description`, `descriptionHtml` (opsional), `category`, `tags` (opsional, format `"a,b,c"`)
  - `file` (File, wajib; pdf/epub, maks 50MB)
  - `cover` (File, opsional; jpg/png/webp, maks 5MB)

**PATCH** `/api/admin/ebooks/:id`
- Auth: `ADMIN`
- Content-Type: `multipart/form-data`
- Fields: sama seperti create, `file` dan `cover` opsional

**DELETE** `/api/admin/ebooks/:id`
- Auth: `ADMIN`

### Admin: Tag
**POST** `/api/admin/tags`
- Auth: `ADMIN`
- Content-Type: `application/json`
- Body: `{ "name": "Nama Tag" }`

**PATCH** `/api/admin/tags/:id`
- Auth: `ADMIN`
- Body: `{ "name": "Nama Tag" }`

**DELETE** `/api/admin/tags/:id`
- Auth: `ADMIN`

### Admin: Banner
**POST** `/api/admin/banners`
- Auth: `ADMIN`
- Content-Type: `multipart/form-data`
- Fields:
  - `title` (string)
  - `subtitle` (string, opsional)
  - `linkUrl` (string URL, opsional)
  - `isActive` (string `"true"`/`"false"`, opsional)
  - `sortOrder` (number sebagai string, opsional)
  - `image` (File, opsional; jpg/png/webp, maks 5MB)

**PATCH** `/api/admin/banners/:id`
- Auth: `ADMIN`
- Content-Type: `multipart/form-data`

**DELETE** `/api/admin/banners/:id`
- Auth: `ADMIN`

### Admin: Promo Code
**POST** `/api/admin/promos`
- Auth: `ADMIN`
- Content-Type: `application/json`
- Body:
  - `code` (string)
  - `description` (string, opsional)
  - `percentOff` (number 1..95, opsional)
  - `isActive` (boolean, opsional)
  - `startsAt` / `expiresAt` (string datetime ISO, opsional)

**PATCH** `/api/admin/promos/:id`
- Auth: `ADMIN`
- Body sama seperti create

**DELETE** `/api/admin/promos/:id`
- Auth: `ADMIN`

## Kontribusi
Panduan singkat kontribusi (praktik yang disarankan untuk repo ini):
- Buat branch dari `main`: `feat/<nama>`, `fix/<nama>`, atau `chore/<nama>`
- Jalankan sebelum membuat PR:
  - `npm install`
  - `npm run lint`
  - `npm run prisma:generate` (jika ada perubahan schema)
- Untuk perubahan API:
  - Pertahankan sanitasi input (`src/lib/sanitize.ts`) dan validasi Zod (`src/lib/validators.ts`)
  - Pastikan route admin tetap diproteksi oleh middleware (`middleware.ts`)
- Untuk perubahan schema:
  - Update `prisma/schema.prisma`
  - Jalankan `npm run prisma:push` pada database dev/test

## Changelog
### Unreleased
- Dokumentasi diperbarui agar sesuai dengan implementasi storage berbasis filesystem lokal.

### 0.1.0
- Auth (register + login) dengan NextAuth Credentials (JWT session)
- Role-based access: `ADMIN` vs `PUBLIC`
- Admin dashboard: produk, e-book, banner, tag, promo, moderasi komentar
- Produk: submit oleh user (status `PENDING`) + moderasi status oleh admin
- Upload gambar/covers/banners ke storage lokal + serving via `/media/*`
- Download e-book dengan proteksi login

## Roadmap (Rencana Fitur)
Beberapa peluang peningkatan yang relevan dengan codebase saat ini:
- Storage eksternal (Vercel Blob/S3) agar kompatibel untuk deployment serverless
- Endpoint list/filter/pagination untuk admin (saat ini sebagian besar list di-handle oleh server component)
- Pencarian & filter produk berdasarkan kategori/tag + sort terbaru/populer
- Audit log untuk aksi admin (moderasi, publish, delete)
- Notifikasi (email) untuk:
  - Konfirmasi registrasi / reset password
  - Perubahan status produk/komentar
- Peningkatan keamanan:
  - CSRF hardening untuk flow tertentu
  - Rate limit per-action yang bisa dikonfigurasi via env
  - Upload scanning (opsional) untuk file e-book

## Troubleshooting singkat
- Prisma Client bermasalah setelah install/clone: jalankan `npm run postinstall`
- Prisma tidak menemukan `DATABASE_URL`: pastikan `DATABASE_URL` ada di `.env` (root) atau `prisma/.env` saat menjalankan perintah Prisma
