import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Navbar } from "~/components/navbar";
import { createClient } from "~/lib/supabase/server";
import { ThemeProvider } from "./theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Lumos — Know your chords. Discover what's next.",
  description:
    "Understand the progression you're playing and explore new directions with AI-powered suggestions shaped around the mood you want.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <Navbar user={user ? { email: user.email ?? "" } : null} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
