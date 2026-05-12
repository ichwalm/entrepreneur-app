/** @type {import('next').NextConfig} */
const nextConfig = {
  // Wajib jika web kamu menampilkan gambar dari luar (seperti Vercel Blob, AWS S3, dll)
  images: {
    domains: ['blob.vercel-storage.com'], 
  },
  
  // Sangat disarankan dinyalakan agar Next.js lebih ketat mengecek error
  reactStrictMode: true,
};

module.exports = nextConfig;