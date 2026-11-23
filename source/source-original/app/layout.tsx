import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'BI-PLANE BATTLE — Biplane Arcade',description:'A retro side-scrolling biplane arcade. Strike from above, catch parachutes, and survive the skies.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
