import type { Metadata } from "next";
import { Geist_Mono, Patrick_Hand, Comic_Relief } from "next/font/google";
import "./globals.css";
import { InkCursor } from "@/components/InkCursor";

const hand = Patrick_Hand({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400"],
});

// Vox uses Comic Relief for headings
const display = Comic_Relief({
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
