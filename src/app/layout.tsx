import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { NavBar } from "@/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function getMetadataBase() {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_URL;
  if (!env) return new URL("http://localhost:3000");
  const url =
    env.startsWith("http://") || env.startsWith("https://") ? env : `https://${env}`;
  try {
    return new URL(url);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Entrepreneur Platform",
    template: "%s · Entrepreneur Platform",
  },
  description:
    "Website profile modern untuk kewirausahaan: e-book materi, promosi produk, dan dashboard admin untuk manajemen konten.",
  applicationName: "Entrepreneur Platform",
  keywords: [
    "kewirausahaan",
    "entrepreneur",
    "UMKM",
    "promosi produk",
    "e-book",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Entrepreneur Platform",
    title: "Entrepreneur Platform",
    description:
      "Website profile modern untuk kewirausahaan: e-book materi, promosi produk, dan dashboard admin untuk manajemen konten.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Entrepreneur Platform",
    description:
      "Website profile modern untuk kewirausahaan: e-book materi, promosi produk, dan dashboard admin untuk manajemen konten.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <div className="flex min-h-full flex-col">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
            >
              Skip to content
            </a>
            <NavBar />
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
