import type { Metadata } from "next";
import { Geist_Mono, Patrick_Hand, Sour_Gummy } from "next/font/google";
import "./globals.css";
import { InkCursor } from "@/components/InkCursor";

const hand = Patrick_Hand({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["400"],
});

// Vox uses Sour Gummy for headings
const display = Sour_Gummy({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "500",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Addel — Portfolio",
  description: "Addel Hamoudhy — vibe coder, AI tinkerer, tech enthusiast.",
  metadataBase: new URL("https://addel.xyz"),
  openGraph: {
    title: "Addel — Portfolio",
    description: "Hi, I'm Addel.",
    url: "https://addel.xyz",
    siteName: "Addel",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Addel — Portfolio",
    description: "Hi, I'm Addel.",
  },
  icons: {
    icon: "/icon.svg",
  },
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
