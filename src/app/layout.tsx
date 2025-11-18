import './globals.css';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Toaster } from 'sonner';

import { UserModeProvider } from '@/context/UserModeContext';

const monstserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: 'Uni Vagas',
  description: 'Vagas UNA | Una Itabira',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='pt-br'>
      <body className={`${monstserrat.variable} antialiased`}>
        <UserModeProvider>
          <Toaster richColors position='top-right' duration={4000} />
          {children}
        </UserModeProvider>
      </body>
    </html>
  );
}
