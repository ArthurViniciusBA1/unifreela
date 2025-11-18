'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { BriefcaseBusiness, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';
import { useUserMode } from '@/context/UserModeContext';

interface ProjetosClientLayoutProps {
  projetos: any[];
  totalProjetos: number;
  currentPage: number;
  limitPerPage: number;
}

export default function ProjetosClientLayout({ projetos, totalProjetos, currentPage, limitPerPage }: ProjetosClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { currentMode } = useUserMode();

  // Só mostra se estiver no modo FREELANCER
  if (currentMode !== 'FREELANCER') {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`${pathname}?${newSearchParams.toString()}`);
    });
  };

  const totalPages = Math.ceil(totalProjetos / limitPerPage);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <BriefcaseBusiness size={32} /> Projetos Disponíveis
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Explore as oportunidades que esperam por você.
        </p>
      </header>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projetos.length === 0 ? (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Nenhum projeto disponível no momento.</p>
            <p className='mt-2 text-sm'>Verifique novamente mais tarde.</p>
          </div>
        ) : (
          projetos.map((projeto: any) => (
            <div
              key={projeto.id}
              className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow'
            >
              <div className='flex items-center mb-4'>
                <div>
                  <h2 className='text-xl font-bold text-primary'>{projeto.titulo}</h2>
                  <p className='text-muted-foreground text-sm'>
                    {projeto.criadoPor?.perfilCliente?.nomeFantasia || projeto.criadoPor?.nome || 'Cliente'}
                  </p>
                </div>
              </div>

              <p className='text-foreground text-sm mb-3 line-clamp-3'>{projeto.descricao}</p>
              <div className='text-sm text-gray-600 mb-3'>
                <p>
                  <strong>Tipo:</strong> {projeto.tipo.replace(/_/g, ' ').toLowerCase()}
                </p>
                <p>
                  <strong>Formato:</strong> {projeto.remoto ? 'Remoto' : 'Presencial'}
                </p>
                {projeto.orcamentoEstimado && (
                  <p>
                    <strong>Orçamento:</strong> {projeto.orcamentoEstimado}
                  </p>
                )}
                {projeto.prazoEstimado && (
                  <p>
                    <strong>Prazo:</strong> {projeto.prazoEstimado}
                  </p>
                )}
              </div>

              <div className='mt-auto flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border'>
                <span>Publicado em: {formatarData(projeto.dataPublicacao)}</span>
                <Button asChild size='sm'>
                  <Link href={`/projetos/${projeto.id}`}>Ver Detalhes</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </section>

      {totalPages > 1 && (
        <div className='flex justify-center items-center gap-4 mt-8'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPreviousPage || isPending}
          >
            <ChevronLeft size={16} className='mr-2' /> Anterior
          </Button>
          <span className='text-sm font-medium text-foreground'>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage || isPending}
          >
            Próxima <ChevronRight size={16} className='ml-2' />
          </Button>
        </div>
      )}
    </div>
  );
}

