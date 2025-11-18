'use client';

import { StatusProjeto } from '@prisma/client';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pause,
  Pencil,
  Play,
  PlusCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  fetchProjetosDoCliente,
  alterarStatusProjetoAction,
} from '@/actions/projetoActions';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';
import { useUserMode } from '@/context/UserModeContext';

interface ProjetosClienteLayoutProps {
  projetos: any[];
  totalProjetos: number;
  currentPage: number;
  limitPerPage: number;
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default function ProjetosClienteLayout({
  projetos: initialProjetos,
  totalProjetos: initialTotal,
  currentPage: initialPage,
  limitPerPage: initialLimit,
  searchParams,
}: ProjetosClienteLayoutProps) {
  const router = useRouter();
  const searchParamsObj = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { currentMode } = useUserMode();

  const [projetos, setProjetos] = useState<any[] | null>(initialProjetos);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProjetos, setTotalProjetos] = useState(initialTotal);

  const ignoreStrictDoubleRender = useRef(false);

  const currentPage = parseInt(searchParamsObj.get('page') || '1');
  const limitPerPage = parseInt(searchParamsObj.get('limit') || '9');

  const loadProjetos = useCallback(async (page: number, limit: number) => {
    setIsLoading(true);
    setError(null);
    const toastId = toast.loading('Carregando projetos...');

    try {
      const result = await fetchProjetosDoCliente({ page, limit });

      if (result.success) {
        setProjetos(result.projetos || []);
        setTotalProjetos(result.total || 0);
        toast.success('Projetos carregados!', { id: toastId, duration: 2000 });
      } else {
        setError(result.error || 'Falha ao carregar projetos.');
        toast.error(result.error || 'Falha ao carregar projetos.', {
          id: toastId,
        });
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado.');
      toast.error('Ocorreu um erro inesperado.', { id: toastId });
      console.error('Erro no loadProjetos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentMode !== 'CLIENTE') {
      return;
    }

    if (
      !ignoreStrictDoubleRender.current &&
      (currentPage !== initialPage || limitPerPage !== initialLimit)
    ) {
      ignoreStrictDoubleRender.current = true;
      loadProjetos(currentPage, limitPerPage);
    }
  }, [
    currentPage,
    limitPerPage,
    currentMode,
    initialPage,
    initialLimit,
    loadProjetos,
  ]);

  // Só mostra se estiver no modo CLIENTE
  if (currentMode !== 'CLIENTE') {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    ignoreStrictDoubleRender.current = false;
    startTransition(() => {
      const newSearchParams = new URLSearchParams(searchParamsObj.toString());
      newSearchParams.set('page', newPage.toString());
      router.push(`/projetos?${newSearchParams.toString()}`);
    });
  };

  const totalPages = Math.ceil(totalProjetos / limitPerPage);
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const handleEditProjeto = (projetoId: string) => {
    router.push(`/projetos/editar/${projetoId}`);
  };

  const handleToggleStatus = (projetoId: string, status: StatusProjeto) => {
    const nextStatus =
      status === StatusProjeto.ABERTO
        ? StatusProjeto.RASCUNHO
        : StatusProjeto.ABERTO;
    const actionLabel =
      nextStatus === StatusProjeto.ABERTO ? 'Reabrindo' : 'Pausando';
    const toastId = toast.loading(`${actionLabel} projeto...`);

    startTransition(async () => {
      const result = await alterarStatusProjetoAction(projetoId, nextStatus);

      if (result.success) {
        toast.success('Status atualizado com sucesso!', { id: toastId });
        setProjetos((prev) =>
          (prev || []).map((projeto) =>
            projeto.id === projetoId
              ? { ...projeto, status: nextStatus }
              : projeto
          )
        );
      } else {
        toast.error(result.error || 'Falha ao atualizar status.', {
          id: toastId,
        });
      }
    });
  };

  if (isLoading && !projetos) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
        <span className='ml-4 text-muted-foreground'>
          Carregando projetos...
        </span>
      </div>
    );
  }

  if (error && !projetos) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{error}</p>
        <p className='mt-4 text-center'>
          Por favor, tente{' '}
          <Button
            variant='link'
            onClick={() => loadProjetos(currentPage, limitPerPage)}
            className='p-0 h-auto underline'
          >
            novamente
          </Button>
          .
        </p>
      </div>
    );
  }

  if (!projetos) {
    return (
      <div className='col-span-full text-center text-muted-foreground py-12'>
        <p className='text-xl'>
          Não foi possível carregar os projetos. Tente novamente.
        </p>
        <p className='mt-2 text-sm'>
          <Button
            variant='link'
            onClick={() => loadProjetos(currentPage, limitPerPage)}
            className='p-0 h-auto underline'
          >
            Recarregar
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          Meus Projetos
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Controle os projetos publicados para contratar freelancers.
        </p>
        <Button asChild className='mt-4'>
          <Link href='/projetos/novo'>
            <PlusCircle size={18} className='mr-2' /> Novo Projeto
          </Link>
        </Button>
      </header>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {projetos.length === 0 ? (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Nenhum projeto encontrado.</p>
            <p className='mt-2 text-sm'>
              <Link href='/projetos/novo' className='text-primary underline'>
                Publique seu primeiro projeto
              </Link>{' '}
              agora!
            </p>
          </div>
        ) : (
          projetos.map((projeto: any) => (
            <div
              key={projeto.id}
              className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow'
            >
              <div className='flex items-center mb-4'>
                <div>
                  <h2 className='text-xl font-bold text-primary'>
                    {projeto.titulo}
                  </h2>
                  <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                    {projeto.status.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
              </div>

              <p className='text-foreground text-sm mb-3 line-clamp-3'>
                {projeto.descricao}
              </p>
              <div className='text-sm text-gray-600 mb-3'>
                <p>
                  <strong>Tipo:</strong>{' '}
                  <span className='capitalize'>
                    {projeto.tipo.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </p>
                <p>
                  <strong>Formato:</strong>{' '}
                  {projeto.remoto ? 'Remoto' : 'Presencial'}
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
                <span>
                  Publicado em: {formatarData(projeto.dataPublicacao)}
                </span>
                <div className='flex gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => handleEditProjeto(projeto.id)}
                    disabled={isPending}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant={
                      projeto.status === StatusProjeto.ABERTO
                        ? 'destructive'
                        : 'default'
                    }
                    size='icon'
                    onClick={() =>
                      handleToggleStatus(projeto.id, projeto.status)
                    }
                    disabled={isPending}
                    className={
                      projeto.status === StatusProjeto.ABERTO
                        ? 'text-destructive hover:bg-destructive hover:text-white'
                        : 'text-green-600 hover:text-green-700'
                    }
                  >
                    {projeto.status === StatusProjeto.ABERTO ? (
                      <Pause size={16} aria-label='Pausar' />
                    ) : (
                      <Play size={16} aria-label='Reabrir' />
                    )}
                  </Button>
                </div>
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
