import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getHomepageSettings } from "@/lib/siteSettings";
import type { Banner, Prisma, PromoCode } from "@prisma/client";

export const dynamic = "force-dynamic";

type EbookWithTags = Prisma.EbookGetPayload<{
  include: { tags: { include: { tag: true } } };
}>;

type ProductShowcase = Prisma.ProductGetPayload<{
  include: { images: true; tags: { include: { tag: true } } };
}>;

export default async function Home() {
  const [banners, promos, featuredProducts, latestProducts, ebooks, homepage] =
    await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
      prisma.promoCode.findMany({
        where: { isActive: true },
        orderBy: [{ expiresAt: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
      prisma.product.findMany({
        where: { isFeatured: true, status: "APPROVED" },
        orderBy: { updatedAt: "desc" },
        take: 10,
        include: {
          images: { take: 1, orderBy: { createdAt: "asc" } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.product.findMany({
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          images: { take: 1, orderBy: { createdAt: "asc" } },
          tags: { include: { tag: true } },
        },
      }),
      prisma.ebook.findMany({
        orderBy: { uploadedAt: "desc" },
        take: 9,
        include: { tags: { include: { tag: true } } },
      }),
      getHomepageSettings(),
    ]);

  return (
    <div className="w-full">
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="bg-grid-boxes" />
          <div className="absolute left-[-120px] top-[-120px] h-72 w-72 rounded-full bg-brand/25 blur-3xl" />
          <div className="absolute right-[-120px] top-[40px] h-72 w-72 rounded-full bg-brand2/20 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[20%] h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-3 py-1 text-xs text-foreground/80">
              <span className="h-2 w-2 rounded-full bg-brand" />
              {homepage.heroBadge}
            </div>
            <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
              {homepage.heroTitle}
            </h1>
            <p className="max-w-xl text-base leading-8 text-foreground/75">
              {homepage.heroDescription}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/#showcase"
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90"
              >
                Lihat Produk
              </Link>
              <Link
                href="/#ebooks"
                className="rounded-lg border border-accent px-5 py-2.5 text-sm hover:bg-accent"
              >
                Jelajahi E-Book
              </Link>
              <Link
                href="/#contact"
                className="rounded-lg border border-accent px-5 py-2.5 text-sm hover:bg-accent"
              >
                Hubungi Kami
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 text-sm text-foreground/70">
              <div className="rounded-xl border border-accent bg-background/50 px-3 py-3">
                <div className="text-lg font-semibold text-foreground">3s</div>
                <div className="mt-1">Target load cepat</div>
              </div>
              <div className="rounded-xl border border-accent bg-background/50 px-3 py-3">
                <div className="text-lg font-semibold text-foreground">SEO</div>
                <div className="mt-1">Metadata + struktur</div>
              </div>
              <div className="rounded-xl border border-accent bg-background/50 px-3 py-3">
                <div className="text-lg font-semibold text-foreground">WCAG</div>
                <div className="mt-1">Aksesibilitas</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative h-80 w-full max-w-lg md:h-[450px] lg:h-[550px]">
              <Image
                src="/illustrations/hero_illustration.png"
                alt="Technology and Business Growth"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="theme-illustration object-contain transition-transform duration-700 hover:scale-105"
                priority
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-14">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <BannerCarousel banners={banners} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-accent bg-background/50 p-4">
                <div className="text-xs text-foreground/60">Promo Aktif</div>
                <PromoList promos={promos} />
              </div>
              <div className="rounded-2xl border border-accent bg-background/50 p-4">
                <div className="text-xs text-foreground/60">Katalog</div>
                <div className="mt-3 space-y-2 text-sm text-foreground/80">
                  <div className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2">
                    <span>E-Book Materi</span>
                    <span className="text-xs text-foreground/60">Free/Member</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2">
                    <span>Produk UMKM</span>
                    <span className="text-xs text-foreground/60">Showcase</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2">
                    <span>Testimoni</span>
                    <span className="text-xs text-foreground/60">Brand trust</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div className="text-xs font-semibold tracking-widest text-foreground/60">
              {homepage.aboutEyebrow}
            </div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {homepage.aboutTitle}
            </h2>
            <p className="text-base leading-8 text-foreground/75">
              {homepage.aboutDescription}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FeatureCard title="Konten Terstruktur" text="Banner, produk unggulan, promo codes, dan e-book." />
              <FeatureCard title="Moderasi Komentar" text="Komentar threaded dengan approval admin." />
              <FeatureCard title="Optimasi Performa" text="Image optimization, layout efisien, dan server rendering." />
              <FeatureCard title="Aksesibilitas" text="Navigasi jelas, heading rapi, dan fokus state." />
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative h-80 w-full max-w-lg md:h-[400px]">
                <Image
                  src="/illustrations/about_illustration.png"
                  alt="Teamwork and Structured Workflow"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="theme-illustration object-contain transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
            <div className="rounded-3xl border border-accent bg-accent/10 p-6">
            <div className="rounded-2xl border border-accent bg-background p-6">
              <div className="text-xs text-foreground/60">Tagline</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight">
                {homepage.aboutTaglineTitle}
              </div>
              <div className="mt-4 text-sm text-foreground/75">
                {homepage.aboutTaglineSubtitle}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-brand/15 px-3 py-1 text-xs text-brand">
                  Modern UI
                </span>
                <span className="rounded-full bg-brand2/15 px-3 py-1 text-xs text-brand2">
                  Promo-ready
                </span>
                <span className="rounded-full bg-accent/40 px-3 py-1 text-xs text-foreground/80">
                  Admin CMS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      <section id="showcase" className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-widest text-foreground/60">
              PRODUCT SHOWCASE
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Produk unggulan & terbaru
            </h2>
          </div>
          <Link
            href="/#contact"
            className="hidden rounded-lg border border-accent px-4 py-2 text-sm hover:bg-accent sm:inline-flex"
          >
            Ajukan promosi
          </Link>
        </div>

        <ShowcaseCarousel
          featured={featuredProducts as ProductShowcase[]}
          fallback={latestProducts as ProductShowcase[]}
        />
      </section>

      <section id="ebooks" className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-widest text-foreground/60">
              RESOURCES
            </div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Materi e-book kewirausahaan
            </h2>
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Login untuk download
          </Link>
        </div>
        <EbookGrid ebooks={ebooks as EbookWithTags[]} />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="rounded-3xl border border-accent bg-accent/10 p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-widest text-foreground/60">
                TESTIMONI
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Dipercaya oleh pelaku usaha
              </h2>
              <p className="text-base text-foreground/75">
                Tampilan rapi, proses konten cepat, dan promosi lebih terarah.
              </p>
            </div>
            <TestimonialGrid />
          </div>
        </div>
      </section>

      <section id="contact" className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="rounded-3xl border border-accent bg-background p-6 md:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
            <div className="space-y-3">
              <div className="text-xs font-semibold tracking-widest text-foreground/60">
                {homepage.contactEyebrow}
              </div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {homepage.contactTitle}
              </h2>
              <p className="text-base leading-8 text-foreground/75">
                {homepage.contactDescription}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-black hover:opacity-90"
                >
                  Dashboard
                </Link>
                <a
                  href={`mailto:${homepage.contactEmail}`}
                  className="rounded-lg border border-accent px-5 py-2.5 text-sm hover:bg-accent"
                >
                  Email Kami
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center">
                <div className="relative h-72 w-full max-w-lg md:h-[350px]">
                  <Image
                    src="/illustrations/contact_illustration.png"
                    alt="Customer Support and Communication"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="theme-illustration object-contain transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-accent bg-accent/10 p-6">
              <div className="text-sm font-semibold">Kontak</div>
              <div className="mt-3 space-y-2 text-sm text-foreground/80">
                <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                  <span>Email</span>
                  <span className="text-foreground/70">{homepage.contactEmail}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                  <span>WhatsApp</span>
                  <span className="text-foreground/70">{homepage.contactWhatsapp}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background px-3 py-2">
                  <span>Jam Operasional</span>
                  <span className="text-foreground/70">{homepage.contactHours}</span>
                </div>
              </div>
              <div className="mt-4 text-xs text-foreground/60">
                Ganti informasi kontak ini sesuai brand kamu.
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-10 text-center text-xs text-foreground/50">
          © {new Date().getFullYear()} {homepage.footerText}
        </footer>
      </section>
    </div>
  );
}

async function EbookGrid({
  ebooks,
}: {
  ebooks: EbookWithTags[];
}) {
  if (ebooks.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-accent bg-accent/10 px-4 py-6 text-sm text-foreground/70">
        Belum ada e-book. Admin dapat menambahkan lewat dashboard.
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ebooks.map((e) => (
        <Link
          key={e.id}
          href={`/ebooks/${e.id}`}
          className="group rounded-2xl border border-accent bg-background p-5 hover:bg-accent/10"
        >
          <div className="flex gap-4">
            <div className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-accent bg-accent/10">
              {e.coverUrl ? (
                <Image
                  src={e.coverUrl}
                  alt={e.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{e.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-foreground/70">
                {e.description}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-foreground/60">
                <span className="rounded-full bg-accent/40 px-2 py-0.5">
                  {e.category}
                </span>
                <span>{new Date(e.uploadedAt).toLocaleDateString("id-ID")}</span>
              </div>
              {e.tags.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {e.tags.slice(0, 3).map((t) => (
                    <span
                      key={t.tagId}
                      className="rounded-full border border-accent px-2 py-0.5 text-[11px] text-foreground/70"
                    >
                      {t.tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function BannerCarousel({
  banners,
}: {
  banners: Banner[];
}) {
  if (banners.length === 0) {
    return (
      <div className="rounded-2xl border border-accent bg-background/50 p-6">
        <div className="text-xs text-foreground/60">Banner</div>
        <div className="mt-3 text-sm text-foreground/75">
          Tambahkan banner promo dari dashboard admin untuk tampil di sini.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-accent bg-background/50 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-foreground/60">Promo Banner</div>
        <div className="text-xs text-foreground/60">
          {banners.length} item
        </div>
      </div>
      <div className="mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2">
        {banners.map((b) => (
          <div
            key={b.id}
            className="relative w-[85%] shrink-0 snap-start overflow-hidden rounded-xl border border-accent bg-accent/10 sm:w-[70%]"
          >
            {b.imageUrl ? (
              <div className="relative h-40 w-full">
                <Image
                  src={b.imageUrl}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 85vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="h-40 w-full bg-gradient-to-br from-brand/25 via-accent/20 to-brand2/20" />
            )}
            <div className="space-y-2 p-4">
              <div className="text-sm font-semibold">{b.title}</div>
              {b.subtitle ? (
                <div className="line-clamp-2 text-xs text-foreground/70">
                  {b.subtitle}
                </div>
              ) : null}
              {b.linkUrl ? (
                <a
                  href={b.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-xs font-semibold text-brand underline underline-offset-4"
                >
                  Lihat promo
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function PromoList({
  promos,
}: {
  promos: PromoCode[];
}) {
  if (promos.length === 0) {
    return (
      <div className="mt-3 text-sm text-foreground/75">
        Belum ada promo code.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {promos.slice(0, 3).map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2"
        >
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold">{p.code}</div>
            <div className="text-[11px] text-foreground/60">
              {p.percentOff ? `${p.percentOff}% off` : "Promo aktif"}
            </div>
          </div>
          <div className="text-[11px] text-foreground/60">
            {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("id-ID") : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureCard(props: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-accent bg-background p-4">
      <div className="text-sm font-semibold">{props.title}</div>
      <div className="mt-1 text-xs leading-6 text-foreground/70">{props.text}</div>
    </div>
  );
}

async function ShowcaseCarousel({
  featured,
  fallback,
}: {
  featured: ProductShowcase[];
  fallback: ProductShowcase[];
}) {
  const items = featured.length > 0 ? featured : fallback;

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-accent bg-accent/10 px-4 py-8 text-sm text-foreground/70">
        Belum ada produk yang dipromosikan.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.id}`}
            className="group w-[86%] shrink-0 snap-start overflow-hidden rounded-3xl border border-accent bg-background hover:bg-accent/10 sm:w-[60%] lg:w-[40%]"
          >
            <div className="relative h-52 w-full border-b border-accent bg-accent/10">
              {p.images[0]?.url ? (
                <Image
                  src={p.images[0].url}
                  alt={p.title}
                  fill
                  sizes="(max-width: 1024px) 90vw, 40vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-brand/25 via-accent/20 to-brand2/20" />
              )}
              {p.isFeatured ? (
                <div className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-black">
                  Featured
                </div>
              ) : null}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">{p.title}</div>
                  {p.category ? (
                    <div className="mt-1 text-xs text-foreground/60">
                      {p.category}
                    </div>
                  ) : null}
                </div>
                <div className="rounded-full border border-accent bg-accent/10 px-3 py-1 text-xs text-foreground/80">
                  Lihat
                </div>
              </div>
              <div className="mt-3 line-clamp-2 text-sm text-foreground/75">
                {p.description}
              </div>
              {p.locationName ? (
                <div className="mt-3 text-xs text-foreground/60">
                  {p.locationName}
                </div>
              ) : null}
              {p.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags.slice(0, 3).map((t) => (
                    <span
                      key={t.tagId}
                      className="rounded-full border border-accent px-2 py-0.5 text-[11px] text-foreground/70"
                    >
                      {t.tag.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-2 text-xs text-foreground/60">
        Geser untuk melihat lebih banyak
      </div>
    </div>
  );
}

function TestimonialGrid() {
  const items = [
    {
      name: "Rani · Fashion UMKM",
      text: "Tampilan modernnya bikin produk terlihat premium. Proses upload cepat dan rapi.",
    },
    {
      name: "Dimas · Kuliner",
      text: "Website jadi terasa profesional. Komentar bisa dimoderasi jadi lebih aman.",
    },
    {
      name: "Sari · Jasa",
      text: "CTA jelas, pengunjung gampang menemukan informasi dan cara menghubungi.",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((t) => (
        <div key={t.name} className="rounded-2xl border border-accent bg-background p-5">
          <div className="text-sm font-semibold">{t.name}</div>
          <div className="mt-2 text-sm leading-7 text-foreground/75">{t.text}</div>
        </div>
      ))}
    </div>
  );
}
