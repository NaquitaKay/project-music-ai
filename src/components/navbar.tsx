"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "~/app/auth/actions";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

const APP_LINKS = [
  { href: "/melody-to-chords", label: "Melody to Chords" },
  { href: "/chord-suggester", label: "Chord Suggester" },
];

const MARKETING_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-display text-lg font-medium tracking-tight"
    >
      <span
        aria-hidden
        className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
      >
        ♪
      </span>
      Lumos
    </Link>
  );
}

type NavbarProps = {
  user: { email: string } | null;
  isAdmin?: boolean;
};

export function Navbar({ user, isAdmin }: NavbarProps) {
  const pathname = usePathname();
  const isMarketing = pathname === "/";
  const homeHref = user ? "/app" : "/";
  const appLinks = [
    { href: homeHref, label: "Home" },
    ...APP_LINKS,
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  const links = isMarketing ? MARKETING_LINKS : appLinks;
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const isActive = !isMarketing && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-colors hover:text-foreground",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              {isMarketing && (
                <Button asChild size="sm">
                  <Link href="/app">Open the app</Link>
                </Button>
              )}
              <form action={signOut}>
                <Button type="submit" size="sm" variant="outline">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-md text-foreground md:hidden"
              aria-label="Toggle menu"
            >
              <span aria-hidden className="text-lg leading-none">
                {open ? "✕" : "☰"}
              </span>
            </button>
          </SheetTrigger>
          <SheetContent title="Navigation menu">
            <div className="flex flex-col gap-1 pt-8">
              {links.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md px-3 py-2.5 text-base text-foreground hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
            {user ? (
              <div className="mt-2 flex flex-col gap-2">
                {isMarketing && (
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/app">Open the app</Link>
                    </Button>
                  </SheetClose>
                )}
                <form action={signOut}>
                  <Button type="submit" variant="outline" className="w-full">
                    Sign out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <SheetClose asChild>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link href="/signup">Sign Up Free</Link>
                  </Button>
                </SheetClose>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
