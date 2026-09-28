import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Talk to Your Crowd", template: "%s | Talk to Your Crowd" }, description: "Practical strategies to turn customer touchpoints into measurable sales and leads." };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en-US"><body>{children}</body></html>; }
