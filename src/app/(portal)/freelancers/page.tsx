import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import { fetchFreelancersDisponiveis } from '@/actions/freelancerActions';
import FreelancersClientLayout from './FreelancersClientLayout';

interface PaginaFreelancersProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function PaginaFreelancers({ searchParams }: PaginaFreelancersProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const limitPerPage = parseInt(params.limit || '9');

  const result = await fetchFreelancersDisponiveis({ page: currentPage, limit: limitPerPage });

  if (!result.success) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{result.error}</p>
        <p className='mt-4'>Por favor, tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <Suspense
      key={currentPage}
      fallback={
        <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <FreelancersClientLayout
        freelancers={result.freelancers || []}
        totalFreelancers={result.total || 0}
        currentPage={currentPage}
        limitPerPage={limitPerPage}
      />
    </Suspense>
  );
}

