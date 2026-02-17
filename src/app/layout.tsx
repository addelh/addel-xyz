import type { Metadata } from "next";
import { Geist_Mono, Patrick_Hand, Gloria_Hallelujah } from "next/font/google";
import "./globals.css";
import { InkCursor } from "@/components/InkCursor";

const hand = Patrick_Hand({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400"],
});

// Vox uses Gloria Hallelujah for headings
const display = Gloria_Hallelujah({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Addel — Portfolio",
  description: "Addel Hamoudhy — coder, AI tinkerer, tech enthusiast.",
  metadataBase: new URL("https://addel.xyz"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${hand.variable} ${display.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <InkCursor />
      </body>
    </html>
  );
}
