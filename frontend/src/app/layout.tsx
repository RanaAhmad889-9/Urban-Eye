import type { Metadata } from 'next';
import { Syne, Space_Grotesk } from 'next/font/google';
import './globals.css';

const display = Syne({ subsets: ['latin'], variable: '--font-display', weight: ['400','600','700','800'] });
const body = Space_Grotesk({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','500','600'] });

export const metadata: Metadata = {
  title: 'UrbanEye — Satellite Intelligence',
  description: 'AI-powered satellite image analysis and building detection.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${body.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
