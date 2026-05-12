import Link from "next/link";
import Image from "next/image";
import { AuthButtons } from "@/components/AuthButtons";

export function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-accent/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" sizes="32px" />
          </span>
          <span>Entrepreneur</span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-7 text-sm text-foreground/80 md:flex">
          <Link href="/#home" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/#about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/#showcase" className="hover:text-foreground">
            Showcase
          </Link>
          <Link href="/#ebooks" className="hover:text-foreground">
            E-Book
          </Link>
          <Link href="/#contact" className="hover:text-foreground">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <AuthButtons />
          </div>

          <details className="md:hidden">
            <summary className="cursor-pointer list-none rounded-lg border border-accent px-3 py-2 text-sm">
              Menu
            </summary>
            <div className="absolute right-4 mt-2 w-56 rounded-xl border border-accent bg-background p-2 shadow-lg">
              <div className="flex flex-col gap-1 text-sm">
                <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#home">
                  Home
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#about">
                  About
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#showcase">
                  Showcase
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#ebooks">
                  E-Book
                </Link>
                <Link className="rounded-lg px-3 py-2 hover:bg-accent" href="/#contact">
                  Contact
                </Link>
                <div className="border-t border-accent/80 pt-2">
                  <AuthButtons />
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
