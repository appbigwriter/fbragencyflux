import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Thirties · by Maia Mendes",
  description: "Evidence-based living, in your thirties.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
