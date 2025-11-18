'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { enviarPropostaAction } from '@/actions/propostaActions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';

interface BotaoPropostaProps {
  projetoId: string;
}

export function BotaoCandidatura({ projetoId }: BotaoPropostaProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [valor, setValor] = useState('');
  const [prazo, setPrazo] = useState('');
  const [mensagem, setMensagem] = useState('');

  const resetForm = () => {
    setValor('');
    setPrazo('');
    setMensagem('');
  };

  const enviarProposta = async () => {
    if (!valor || !prazo || !mensagem) {
      toast.error('Informe valor, prazo e mensagem para enviar sua proposta.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await enviarPropostaAction({
        projetoId,
        valor,
        prazoEstimadoDias: Number(prazo),
        mensagem,
      });

      if (result.success) {
        toast.success('Proposta enviada com sucesso!');
        resetForm();
        setIsDialogOpen(false);
        router.push('/propostas');
      } else {
        toast.error(result.error || 'Falha ao enviar a proposta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleApplyClick} disabled={isLoading} className='w-full sm:w-auto'>
          {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Enviar proposta'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Envie sua proposta</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <FloatingLabelTextarea
            label='Mensagem'
            id='mensagemProposta'
            rows={4}
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
          />
          <FloatingLabelInput
            label='Valor proposto (R$)'
            id='valorProposta'
            inputMode='decimal'
            value={valor}
            onChange={(e) => setValor(e.target.value.replace(/[^\d.,]/g, ''))}
          />
          <FloatingLabelInput
            label='Prazo estimado (dias)'
            id='prazoProposta'
            inputMode='numeric'
            value={prazo}
            onChange={(e) => setPrazo(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <DialogFooter className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
          <DialogClose asChild>
            <Button type='button' variant='secondary'>
              Cancelar
            </Button>
          </DialogClose>
          <Button type='button' variant='outline' asChild>
            <Link href='/perfil'>Editar currículo</Link>
          </Button>
          <Button type='button' onClick={enviarProposta} disabled={isLoading}>
            {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
