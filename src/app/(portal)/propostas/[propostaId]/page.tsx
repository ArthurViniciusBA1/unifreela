import { notFound } from 'next/navigation';
import { ArrowLeft, FileWarning } from 'lucide-react';
import Link from 'next/link';

import { fetchPropostaDetalhes } from '@/actions/propostaActions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';
import { authorizeUser } from '@/lib/auth.server';
import { RoleUsuario } from '@prisma/client';
import { PropostaDetalhesClient } from './PropostaDetalhesClient';

export default async function PaginaDetalheProposta({
  params,
}: {
  params: Promise<{ propostaId: string }>;
}) {
  const { propostaId } = await params;
  const auth = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);
  const result = await fetchPropostaDetalhes(propostaId);

  if (!result.success || !result.proposta) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4'>
        <FileWarning size={64} className='text-destructive mb-4' />
        <h1 className='text-3xl font-bold mb-2'>Erro ao Carregar Proposta</h1>
        <p className='text-muted-foreground'>
          {result.error || 'A proposta não foi encontrada.'}
        </p>
        <Button asChild className='mt-4'>
          <Link href='/propostas'>Voltar para Propostas</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-6'>
        <Button asChild variant='outline'>
          <Link href='/propostas'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para Propostas
          </Link>
        </Button>
      </div>

      <div className='bg-card border rounded-lg p-6 mb-6'>
        <div className='flex justify-between items-start mb-4'>
          <div>
            <h1 className='text-2xl font-bold text-primary mb-2'>
              {result.proposta.projeto.titulo}
            </h1>
            <p className='text-muted-foreground'>
              Proposta de {result.proposta.freelancer.nome}
            </p>
          </div>
          <Badge variant='outline' className='text-base capitalize'>
            {result.proposta.status.replace(/_/g, ' ').toLowerCase()}
          </Badge>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div>
            <p className='text-sm text-muted-foreground'>Valor Proposto</p>
            <p className='text-lg font-semibold'>
              R${' '}
              {Number(result.proposta.valorProposto).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Prazo Estimado</p>
            <p className='text-lg font-semibold'>
              {result.proposta.prazoEstimadoDias} dias
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Enviada em</p>
            <p className='text-lg font-semibold'>
              {formatarData(result.proposta.createdAt)}
            </p>
          </div>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-2'>Mensagem</h2>
          <p className='text-gray-700 whitespace-pre-line leading-relaxed'>
            {result.proposta.mensagem}
          </p>
        </div>

        <PropostaDetalhesClient
          proposta={result.proposta}
          userId={auth.userId || undefined}
        />
      </div>
    </div>
  );
}
