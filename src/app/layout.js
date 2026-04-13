import './globals.css';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MARKUP Pro — Client Dashboard',
  description: 'Premium client management dashboard for tax professionals.',
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
