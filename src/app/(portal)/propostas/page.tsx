'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useUserMode } from '@/context/UserModeContext';
import PropostasFreelancerLayout from './PropostasFreelancerLayout';
import PropostasClienteLayout from './PropostasClienteLayout';

export default function PaginaPropostas() {
  const { currentMode } = useUserMode();

  return (
    <Suspense
      fallback={
        <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      {currentMode === 'CLIENTE' ? <PropostasClienteLayout /> : <PropostasFreelancerLayout />}
    </Suspense>
  );
}

