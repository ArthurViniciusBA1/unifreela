import React from 'react';

import Footer from '@/components/footer';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='flex flex-col min-h-screen w-full bg-gradient-to-b from-background via-background to-background/80'>
      <div className='flex-grow w-full flex items-center justify-center py-8'>
        {children}
      </div>
      <Footer />
    </div>
  );
}
