import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pi 5 Next.js Starter',
  description: 'Next.js app optimized for Raspberry Pi 5 with Docker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
