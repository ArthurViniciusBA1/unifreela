import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import {
  fetchAvailableProjetos,
  fetchProjetosDoCliente,
} from '@/actions/projetoActions';
import ProjetosClientLayout from './ProjetosClientLayout';
import ProjetosClienteLayout from './ProjetosClienteLayout';

interface PaginaProjetosProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function PaginaProjetos({
  searchParams,
}: PaginaProjetosProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1');
  const limitPerPage = parseInt(params.limit || '9');

  // Busca ambos os tipos de projetos, os componentes client-side vão decidir qual mostrar
  const [result, resultCliente] = await Promise.all([
    fetchAvailableProjetos({ page: currentPage, limit: limitPerPage }),
    fetchProjetosDoCliente({ page: currentPage, limit: limitPerPage }),
  ]);

  return (
    <Suspense
      key={currentPage}
      fallback={
        <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      }
    >
      <ProjetosClientLayout
        projetos={result.projetos || []}
        totalProjetos={result.total || 0}
        currentPage={currentPage}
        limitPerPage={limitPerPage}
      />
      <ProjetosClienteLayout
        projetos={resultCliente.projetos || []}
        totalProjetos={resultCliente.total || 0}
        currentPage={currentPage}
        limitPerPage={limitPerPage}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
