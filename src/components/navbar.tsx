"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

const APP_LINKS = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
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

export function Navbar() {
  const pathname = usePathname();
  const isMarketing = pathname === "/";
  const links = isMarketing ? MARKETING_LINKS : APP_LINKS;
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

        {isMarketing && (
          <div className="hidden md:block">
            <Button asChild size="sm">
              <Link href="/chord-suggester">Try it free</Link>
            </Button>
          </div>
        )}

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
            {isMarketing && (
              <SheetClose asChild>
                <Button asChild className="mt-2">
                  <Link href="/chord-suggester">Try it free</Link>
                </Button>
              </SheetClose>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
