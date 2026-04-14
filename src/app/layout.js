import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MARKUP.AI — Intelligent Tax Platform',
  description: 'AI-powered GST & Income Tax management platform for tax professionals.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={inter.className}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
