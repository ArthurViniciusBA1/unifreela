'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { StatusProposta } from '@prisma/client';

import { atualizarStatusPropostaAction } from '@/actions/propostaActions';
import { Button } from '@/components/ui/button';
import { ResumeDisplay } from '@/components/empresa/ResumeDisplay';
import { useUserMode } from '@/context/UserModeContext';

interface PropostaDetalhesClientProps {
  proposta: any;
  userId?: string;
}

export function PropostaDetalhesClient({ proposta, userId }: PropostaDetalhesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { currentMode } = useUserMode();

  const handleStatusChange = (newStatus: StatusProposta) => {
    const actionLabel = newStatus === StatusProposta.ACEITA ? 'Aceitando' : 'Recusando';
    const toastId = toast.loading(`${actionLabel} proposta...`);

    startTransition(async () => {
      const result = await atualizarStatusPropostaAction(proposta.id, newStatus);

      if (result.success) {
        toast.success(`Proposta ${newStatus === StatusProposta.ACEITA ? 'aceita' : 'recusada'} com sucesso!`, {
          id: toastId,
        });
        router.refresh();
      } else {
        toast.error(result.error || 'Falha ao atualizar status.', { id: toastId });
      }
    });
  };

  const canAccept = proposta.status === StatusProposta.ENVIADA || proposta.status === StatusProposta.EM_NEGOCIACAO;
  const canReject = proposta.status === StatusProposta.ENVIADA || proposta.status === StatusProposta.EM_NEGOCIACAO;

  // Verificar se o usuário é o dono do projeto (cliente)
  const isCliente = currentMode === 'CLIENTE' && proposta.projeto.criadoPorId === userId;

  return (
    <div className='space-y-6'>
      <div className='mt-6'>
        <h2 className='text-lg font-semibold mb-4'>Perfil do Freelancer</h2>
        {proposta.freelancer?.perfilFreelancer && (
          <ResumeDisplay curriculo={proposta.freelancer.perfilFreelancer} />
        )}
      </div>

      {isCliente && (canAccept || canReject) ? (
        <div className='flex gap-4 pt-4 border-t'>
          {canAccept && (
            <Button
              onClick={() => handleStatusChange(StatusProposta.ACEITA)}
              disabled={isPending}
              className='flex-1'
            >
              Aceitar Proposta
            </Button>
          )}
          {canReject && (
            <Button
              onClick={() => handleStatusChange(StatusProposta.RECUSADA)}
              disabled={isPending}
              variant='destructive'
              className='flex-1'
            >
              Recusar Proposta
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}

