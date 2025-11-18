'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface FreelancersClientLayoutProps {
  freelancers: any[];
  totalFreelancers: number;
  currentPage: number;
  limitPerPage: number;
}

export default function FreelancersClientLayout({
  freelancers,
  totalFreelancers,
  currentPage,
  limitPerPage,
}: FreelancersClientLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`${pathname}?${newSearchParams.toString()}`);
    });
  };

  const totalPages = Math.ceil(totalFreelancers / limitPerPage);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <Users size={32} /> Freelancers Disponíveis
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Encontre profissionais qualificados para seus projetos.
        </p>
      </header>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {freelancers.length === 0 ? (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Nenhum freelancer disponível no momento.</p>
            <p className='mt-2 text-sm'>Verifique novamente mais tarde.</p>
          </div>
        ) : (
          freelancers.map((freelancer: any) => (
            <div
              key={freelancer.id}
              className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow'
            >
              <div className='flex items-center mb-4'>
                <div className='flex-1'>
                  <h2 className='text-xl font-bold text-primary'>{freelancer.usuario.nome}</h2>
                  <p className='text-muted-foreground text-sm'>{freelancer.tituloProfissional}</p>
                </div>
              </div>

              {freelancer.resumo && (
                <p className='text-foreground text-sm mb-3 line-clamp-3'>{freelancer.resumo}</p>
              )}

              {freelancer.habilidades && freelancer.habilidades.length > 0 && (
                <div className='mb-3'>
                  <p className='text-xs text-muted-foreground mb-1'>Habilidades:</p>
                  <div className='flex flex-wrap gap-1'>
                    {freelancer.habilidades.slice(0, 3).map((hab: any) => (
                      <span
                        key={hab.nome}
                        className='text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded'
                      >
                        {hab.nome}
                      </span>
                    ))}
                    {freelancer.habilidades.length > 3 && (
                      <span className='text-xs text-muted-foreground'>
                        +{freelancer.habilidades.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {freelancer.valorHora && (
                <p className='text-sm text-gray-600 mb-3'>
                  <strong>Valor/hora:</strong> R${' '}
                  {Number(freelancer.valorHora).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}

              <div className='mt-auto flex justify-end items-center pt-4 border-t border-border'>
                <Button asChild size='sm'>
                  <Link href={`/freelancers/${freelancer.id}`}>Ver Perfil</Link>
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

