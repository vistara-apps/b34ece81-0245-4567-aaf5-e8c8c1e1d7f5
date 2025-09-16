import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ErrorBoundary } from '../components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LendLocal - Borrow and lend everyday items with your neighbors',
  description: 'A marketplace for individuals to lend and borrow small, everyday items within their local community via a Base MiniApp.',
  openGraph: {
    title: 'LendLocal',
    description: 'Borrow and lend everyday items with your neighbors.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
