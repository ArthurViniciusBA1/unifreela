'use client';

import { FileText, Loader2, Mail, MessageSquare, Send, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { fetchPropostasDoCliente } from '@/actions/propostaActions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatarData } from '@/lib/formatters';

export default function PropostasClienteLayout() {
  const [propostas, setPropostas] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPropostas = async () => {
    setIsLoading(true);
    const result = await fetchPropostasDoCliente();
    if (result.success) {
      setPropostas(result.propostas || []);
      setError(null);
    } else {
      setError(result.error || 'Falha ao carregar propostas.');
      toast.error(result.error || 'Falha ao carregar propostas.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPropostas();
  }, []);

  const propostasAgrupadas = useMemo(() => {
    if (!propostas) return {};
    return propostas.reduce((acc: any, proposta: any) => {
      const projetoTitulo = proposta.projeto.titulo;
      if (!acc[projetoTitulo]) {
        acc[projetoTitulo] = [];
      }
      acc[projetoTitulo].push(proposta);
      return acc;
    }, {});
  }, [propostas]);

  const formatarTelefoneWhatsApp = (telefone: string | null | undefined): string => {
    if (!telefone) return '';
    return telefone.replace(/\D/g, '');
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[calc(100vh-200px)] flex-col'>
        <Loader2 className='h-8 w-8 animate-spin text-primary mb-4' />
        <span className='ml-4 text-muted-foreground'>Carregando propostas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4 text-destructive'>
        <p className='text-lg font-semibold'>{error}</p>
        <Button variant='link' onClick={loadPropostas} className='p-0 h-auto underline mt-4'>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className='w-full'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <Users size={32} />
          Propostas Recebidas
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Analise as propostas recebidas para seus projetos.
        </p>
      </header>

      {propostas && Object.keys(propostasAgrupadas).length > 0 ? (
        <Accordion type='single' collapsible className='w-full space-y-4'>
          {Object.entries(propostasAgrupadas).map(([projetoTitulo, propostasDoProjeto]: any) => (
            <AccordionItem
              key={projetoTitulo}
              value={projetoTitulo}
              className='bg-card border rounded-lg shadow-sm'
            >
              <AccordionTrigger className='p-4 font-semibold text-lg hover:no-underline'>
                <div className='flex items-center gap-4'>
                  <span>{projetoTitulo}</span>
                  <Badge variant='secondary'>{propostasDoProjeto.length} proposta(s)</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='border-t'>
                  {propostasDoProjeto.map((proposta: any) => {
                    const curriculo = proposta.freelancer?.perfilFreelancer;
                    // Telefone não está disponível no perfilFreelancer, usar email para contato
                    const telefoneWhats = null;
                    return (
                      <div
                        key={proposta.id}
                        className='grid grid-cols-1 md:grid-cols-4 items-center p-4 border-b last:border-b-0 gap-4'
                      >
                        <div className='md:col-span-1'>
                          <p className='font-medium text-primary'>{proposta.freelancer?.nome || 'Freelancer'}</p>
                          <p className='text-xs text-muted-foreground'>
                            {formatarData(proposta.createdAt)}
                          </p>
                          <p className='text-sm text-muted-foreground mt-1'>
                            R$ {Number(proposta.valorProposto).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className='md:col-span-1 flex justify-center'>
                          <Badge variant='outline' className='capitalize'>
                            {proposta.status.replace(/_/g, ' ').toLowerCase()}
                          </Badge>
                        </div>
                        <div className='md:col-span-2 flex items-center justify-end gap-2'>
                          <Button
                            asChild
                            variant='outline'
                            size='sm'
                            title='Ver Detalhes da Proposta'
                          >
                            <Link href={`/propostas/${proposta.id}`}>
                              <FileText size={16} className='mr-2' />
                              Ver Detalhes
                            </Link>
                          </Button>
                          <Button asChild variant='outline' size='icon' title='Enviar E-mail'>
                            <a href={`mailto:${proposta.freelancer?.email}`}>
                              <Mail size={16} />
                            </a>
                          </Button>
                          {telefoneWhats ? (
                            <Button asChild variant='outline' size='icon' title='Enviar WhatsApp'>
                              <a
                                href={`https://wa.me/${telefoneWhats}`}
                                target='_blank'
                                rel='noopener noreferrer'
                              >
                                <img src='/whatsapp.svg' alt='WhatsApp' className='w-4 h-4' />
                              </a>
                            </Button>
                          ) : (
                            <Button
                              variant='outline'
                              size='icon'
                              disabled
                              title='Freelancer sem telefone'
                            >
                              <MessageSquare size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className='text-center p-8 text-muted-foreground bg-card border rounded-lg'>
          <p>Nenhuma proposta recebida ainda.</p>
        </div>
      )}
    </div>
  );
}

