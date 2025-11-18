/* eslint-disable @typescript-eslint/no-explicit-any */
import { Key } from 'react';
import { Building2, Calendar, DollarSign, MapPin, Tag, UserRoundCheck } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { RoleUsuario } from '@prisma/client';

import { BotaoCandidatura } from '@/components/candidato/BotaoCandidatura';
import { Button } from '@/components/ui/button';
import { authorizeUser } from '@/lib/auth.server';
import { formatarData } from '@/lib/formatters';
import { prisma } from '@/lib/prisma';

export default async function PaginaDetalheProjeto({
  params,
}: {
  params: Promise<{ projetoId: string }>;
}) {
  const { projetoId } = await params;

  const auth = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);

  if (!auth.isAuthorized) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4'>
        <UserRoundCheck size={64} className='text-primary mb-4' />
        <h1 className='text-3xl font-bold mb-2'>Acesso Restrito</h1>
        <p className='text-muted-foreground mb-6'>
          Entre para visualizar detalhes dos projetos.
        </p>
        <Button asChild>
          <Link href='/entrar'>Fazer Login</Link>
        </Button>
      </div>
    );
  }

  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: {
      criadoPor: {
        select: {
          nome: true,
          email: true,
          perfilCliente: {
            select: {
              nomeFantasia: true,
              descricao: true,
              websiteUrl: true,
              localizacao: true,
            },
          },
        },
      },
    },
  });

  if (!projeto) {
    notFound();
  }

  // Campo telefone foi removido do schema do Curriculo
  // Se necessário, pode ser obtido através do perfil do usuário

  const isOwner = projeto.criadoPorId === auth.userId;

  return (
    <div className='max-w-3xl mx-auto bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg my-8'>
      <div className='flex justify-between items-start mb-6'>
        <div>
          <h1 className='text-3xl font-extrabold text-primary mb-2'>{projeto.titulo}</h1>
          <p className='text-xl text-foreground font-semibold flex items-center gap-2'>
            <Building2 size={20} /> {projeto.criadoPor.perfilCliente?.nomeFantasia || 'Cliente'}
          </p>
        </div>
      </div>

      <div className='space-y-4 text-muted-foreground text-sm mb-6'>
        <p className='flex items-center gap-2'>
          <Tag size={16} /> <strong>Tipo:</strong> {projeto.tipo.replace(/_/g, ' ')}
        </p>
        <p className='flex items-center gap-2'>
          <MapPin size={16} /> <strong>Formato:</strong> {projeto.remoto ? 'Remoto' : 'Presencial'}
        </p>
        {projeto.orcamentoEstimado && (
          <p className='flex items-center gap-2'>
            <DollarSign size={16} /> <strong>Orçamento:</strong> {projeto.orcamentoEstimado}
          </p>
        )}
        <p className='flex items-center gap-2'>
          <Calendar size={16} /> <strong>Publicado em:</strong> {formatarData(projeto.dataPublicacao)}
        </p>
      </div>

      <section className='mb-6'>
        <h2 className='text-2xl font-bold text-foreground mb-3'>Descrição do Projeto</h2>
        <p className='text-gray-700 whitespace-pre-line leading-relaxed'>{projeto.descricao}</p>
      </section>

      {projeto.habilidadesDesejadas && projeto.habilidadesDesejadas.length > 0 && (
        <section className='mb-6'>
          <h2 className='text-2xl font-bold text-foreground mb-3'>Habilidades desejadas</h2>
          <ul className='list-disc list-inside text-gray-700'>
            {projeto.habilidadesDesejadas.map((hab: string, index: Key) => (
              <li key={index}>{hab}</li>
            ))}
          </ul>
        </section>
      )}

      {projeto.criadoPor.perfilCliente?.descricao && (
        <section className='mb-6'>
          <h2 className='text-2xl font-bold text-foreground mb-3'>Sobre o cliente</h2>
          <p className='text-gray-700 whitespace-pre-line leading-relaxed'>
            {projeto.criadoPor.perfilCliente.descricao}
          </p>
          {projeto.criadoPor.perfilCliente.websiteUrl && (
            <p className='mt-2 text-sm text-blue-600 hover:underline'>
              <Link
                href={projeto.criadoPor.perfilCliente.websiteUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                Visitar site do cliente
              </Link>
            </p>
          )}
        </section>
      )}

      <footer className='mt-8 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4'>
        <Button asChild variant='outline'>
          <Link href='/projetos'>Voltar para projetos</Link>
        </Button>
        {!isOwner && <BotaoCandidatura projetoId={projeto.id} />}
        {isOwner && (
          <Button asChild>
            <Link href={`/projetos/editar/${projeto.id}`}>Editar Projeto</Link>
          </Button>
        )}
      </footer>
    </div>
  );
}

