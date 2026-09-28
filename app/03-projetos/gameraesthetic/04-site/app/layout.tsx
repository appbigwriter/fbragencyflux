import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Gamer Aesthetic", description: "Transparent, contextual guidance for gaming gear and setups." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
