import Link from "next/link";
import { AuthButtons } from "@/components/AuthButtons";

export function NavBar() {
  return (
    <header className="border-b border-accent">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Wirausaha
        </Link>
        <nav className="flex items-center gap-6 text-sm text-foreground/90">
          <Link href="/#ebooks" className="hover:text-foreground">
            E-Book
          </Link>
          <Link href="/#produk" className="hover:text-foreground">
            Produk
          </Link>
        </nav>
        <AuthButtons />
      </div>
    </header>
  );
}

