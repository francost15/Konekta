import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Konekta - Tu destino perfecto",
  description: "Descubre experiencias auténticas en Konekta. Viaja a través de la historia y la cultura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <header className="flex justify-between items-center px-4 py-2 gap-4 h-16 bg-white shadow-sm">
          <Link href="/home" className="flex items-center">
            <Image src="/Konekta.png" alt="logo" width={70} height={70} priority className="h-auto" />
          </Link>
          <div className="flex items-center gap-4 text-black">
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
      </header>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
