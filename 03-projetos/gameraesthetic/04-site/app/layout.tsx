import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { metadataBase: new URL('https://gameraesthetic.fbr.news'), title: { default: "Gamer Aesthetic — Better gear decisions", template: "%s | Gamer Aesthetic" }, description: "Contextual gaming gear guides, compatibility checks and setup advice without the hype.", openGraph: { title: 'Gamer Aesthetic', description: 'Better gear decisions, without the hype.', type: 'website', url: 'https://gameraesthetic.fbr.news' }, robots: { index: true, follow: true } };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
