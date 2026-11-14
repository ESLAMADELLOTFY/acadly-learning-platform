import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter-face",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acadly | Learning & Assessment",
  description: "A thoughtful learning and assessment platform for students and educators.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${inter.variable} h-full`}
    >
      <body className="h-full w-full bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
