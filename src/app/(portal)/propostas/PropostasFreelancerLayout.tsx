'use client';

import { CheckCircle2, FileText, Loader2, MessageCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { JSX, useState, useEffect, useTransition, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { StatusProposta } from '@prisma/client';

import { fetchUserPropostas, cancelarPropostaAction } from '@/actions/propostaActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

const statusOptions: { value: 'TODOS' | StatusProposta; label: string }[] = [
  { value: 'TODOS', label: 'Todos os status' },
  { value: StatusProposta.ENVIADA, label: 'Enviada' },
  { value: StatusProposta.EM_NEGOCIACAO, label: 'Em negociação' },
  { value: StatusProposta.ACEITA, label: 'Aceita' },
  { value: StatusProposta.RECUSADA, label: 'Recusada' },
];

const getStatusBadgeVariant = (
  status: StatusProposta
): { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: JSX.Element } => {
  switch (status) {
    case StatusProposta.ENVIADA:
      return { variant: 'secondary', icon: <FileText size={14} /> };
    case StatusProposta.EM_NEGOCIACAO:
      return { variant: 'default', icon: <MessageCircle size={14} /> };
    case StatusProposta.ACEITA:
      return { variant: 'outline', icon: <CheckCircle2 size={14} className='text-green-600' /> };
    case StatusProposta.RECUSADA:
      return { variant: 'destructive', icon: <XCircle size={14} /> };
    default:
      return { variant: 'outline', icon: <FileText size={14} /> };
  }
};

export default function PropostasFreelancerLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [propostas, setPropostas] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ignoreStrictDoubleRender = useRef(false);

  const currentStatusFilter = searchParams.get('status') || 'TODOS';

  const loadPropostas = async (status: string) => {
    setIsLoading(true);
    setError(null);

    const statusFiltro = status === 'TODOS' ? undefined : (status as StatusProposta);
    const result = await fetchUserPropostas(statusFiltro);
    if (result.success) {
      setPropostas(result.propostas || []);
    } else {
      setError(result.error || 'Falha ao carregar propostas.');
      toast.error(result.error || 'Falha ao carregar propostas.');
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (!ignoreStrictDoubleRender.current) {
      ignoreStrictDoubleRender.current = true;
      const toastId = toast.loading('Carregando propostas...');
      loadPropostas(currentStatusFilter).then(() => {
        toast.dismiss(toastId);
      });
    }
  }, [currentStatusFilter]);

  const handleStatusChange = (newStatus: string) => {
    ignoreStrictDoubleRender.current = false;
    startTransition(() => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      if (newStatus === 'TODOS') {
        newSearchParams.delete('status');
      } else {
        newSearchParams.set('status', newStatus);
      }
      router.push(`/propostas?${newSearchParams.toString()}`);
    });
  };

  const handleCancelarProposta = (propostaId: string) => {
    startTransition(async () => {
      const result = await cancelarPropostaAction(propostaId);
      if (result.success) {
        toast.success('Proposta cancelada com sucesso.');
        setPropostas((prev) => prev?.filter((c) => c.id !== propostaId) || null);
      } else {
        toast.error(result.error || 'Não foi possível cancelar a proposta.');
      }
    });
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{error}</p>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <FileText size={32} /> Minhas Propostas
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Acompanhe o status das propostas enviadas para projetos.
        </p>
      </header>

      <div className='mb-6 flex justify-end'>
        <Select onValueChange={handleStatusChange} value={currentStatusFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Filtrar por Status' />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {propostas && propostas.length > 0 ? (
          propostas.map((proposta: any) => {
            const statusInfo = getStatusBadgeVariant(proposta.status);
            const canBeCancelled = [StatusProposta.ENVIADA, StatusProposta.EM_NEGOCIACAO].includes(
              proposta.status
            );

            return (
              <div
                key={proposta.id}
                className='bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow'
              >
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex-grow'>
                    <h2 className='text-lg font-bold text-primary'>{proposta.projeto.titulo}</h2>
                    <p className='text-muted-foreground text-xs'>
                      Status do projeto:{' '}
                      <span className='capitalize'>{proposta.projeto.status.toLowerCase()}</span>
                    </p>
                  </div>
                </div>

                <div className='text-sm text-gray-600 mb-4 space-y-1'>
                  <p>
                    <strong>Enviada em:</strong> {formatarData(proposta.createdAt)}
                  </p>
                  <p>
                    <strong>Valor proposto:</strong> R${' '}
                    {Number(proposta.valorProposto).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Prazo estimado:</strong> {proposta.prazoEstimadoDias} dia(s)
                  </p>
                </div>

                <div className='mb-4'>
                  <Badge
                    variant={statusInfo.variant}
                    className='capitalize text-sm font-semibold whitespace-nowrap'
                  >
                    {statusInfo.icon}
                    {proposta.status.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className='mt-auto flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-border gap-2'>
                  <Button asChild size='sm' variant='outline'>
                    <Link href={`/projetos/${proposta.projeto.id}`}>Ver Projeto</Link>
                  </Button>
                  <Button asChild size='sm' variant='outline'>
                    <Link href={`/propostas/${proposta.id}`}>Ver Detalhes</Link>
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size='sm'
                        variant='destructive'
                        disabled={!canBeCancelled || isPending}
                      >
                        <XCircle size={14} className='mr-2' /> Cancelar
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancelar Proposta</DialogTitle>
                        <DialogDescription>
                          Você tem certeza que deseja cancelar sua proposta para o projeto{' '}
                          <strong>{proposta.projeto.titulo}</strong>? Esta ação não pode ser
                          desfeita.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type='button' variant='secondary'>
                            Fechar
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button
                            type='button'
                            variant='destructive'
                            onClick={() => handleCancelarProposta(proposta.id)}
                          >
                            Sim, cancelar
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })
        ) : (
          <div className='col-span-full text-center text-muted-foreground py-12'>
            <p className='text-xl'>Nenhuma proposta encontrada para este filtro.</p>
            <p className='mt-2 text-sm'>
              Explore os{' '}
              <Link href='/projetos' className='text-primary underline'>
                projetos disponíveis
              </Link>{' '}
              e encontre sua próxima oportunidade!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

