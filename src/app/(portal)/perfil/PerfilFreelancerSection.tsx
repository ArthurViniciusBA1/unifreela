'use client';

import {
  Award,
  Briefcase,
  EyeIcon,
  FileText,
  Languages,
  Lightbulb,
  Loader2,
  Star,
  UserCircle2,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

import { DashboardModalsManager } from '@/components/curriculo/DashboardModalsManager';
import { Button } from '@/components/ui/button';
import { useCandidato } from '@/context/CandidatoContext';

type ActiveModalType =
  | 'infoPessoal'
  | 'experiencia'
  | 'formacao'
  | 'habilidades'
  | 'idiomas'
  | 'projetos'
  | 'certificacoes'
  | null;

export function PerfilFreelancerSection() {
  const { candidato, curriculo, isLoading, error } = useCandidato();
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-[200px]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <span className='ml-4 text-muted-foreground'>Carregando perfil...</span>
      </div>
    );
  }

  if (error || !candidato) {
    return (
      <div className='flex flex-col items-center justify-center text-center p-6 text-destructive'>
        <p className='text-lg font-semibold'>
          {error || 'Não foi possível carregar os dados do perfil.'}
        </p>
      </div>
    );
  }

  const secoesCurriculo = [
    {
      nome: 'Informações Pessoais',
      icon: UserCircle2,
      action: () => setActiveModal('infoPessoal'),
      filled: !!curriculo?.tituloProfissional,
    },
    {
      nome: 'Experiências Profissionais',
      icon: Briefcase,
      action: () => setActiveModal('experiencia'),
      filled: (curriculo?.experiencias?.length ?? 0) > 0,
    },
    {
      nome: 'Formação Acadêmica',
      icon: FileText,
      action: () => setActiveModal('formacao'),
      filled: (curriculo?.formacoes?.length ?? 0) > 0,
    },
    {
      nome: 'Habilidades',
      icon: Star,
      action: () => setActiveModal('habilidades'),
      filled: (curriculo?.habilidades?.length ?? 0) > 0,
    },
    {
      nome: 'Idiomas',
      icon: Languages,
      action: () => setActiveModal('idiomas'),
      filled: (curriculo?.idiomas?.length ?? 0) > 0,
    },
    {
      nome: 'Projetos',
      icon: Lightbulb,
      action: () => setActiveModal('projetos'),
      filled: Boolean(
        curriculo?.projetosPortfolio &&
          (curriculo.projetosPortfolio as unknown[]).length > 0
      ),
    },
    {
      nome: 'Certificações',
      icon: Award,
      action: () => setActiveModal('certificacoes'),
      filled: (curriculo?.certificacoes?.length ?? 0) > 0,
    },
  ];

  return (
    <div className='w-full'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-foreground mb-2'>
          Perfil Freelancer
        </h2>
      </div>

      {!curriculo?.id && (
        <div className='mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'>
          <p className='font-medium'>
            Parece que você ainda não iniciou seu currículo.
          </p>
          <p className='text-sm'>
            Clique em &quot;Informações Pessoais&quot; para começar a preencher!
          </p>
        </div>
      )}
      {curriculo?.id && curriculo.tituloProfissional && (
        <p className='mb-6 text-muted-foreground'>
          Seu currículo atual:{' '}
          <span className='font-semibold text-foreground'>
            {curriculo.tituloProfissional}
          </span>
        </p>
      )}

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
        {secoesCurriculo.map((secao) => (
          <Button
            key={secao.nome}
            variant='outline'
            className='justify-start h-auto py-3 text-left group'
            onClick={secao.action}
          >
            <secao.icon
              size={20}
              className='mr-3 text-primary group-hover:text-accent-foreground shrink-0'
            />
            <div className='flex-grow'>
              <span className='font-medium'>{secao.nome}</span>
            </div>
          </Button>
        ))}
      </div>

      <DashboardModalsManager
        activeModal={activeModal}
        setActiveModal={setActiveModal}
      />
    </div>
  );
}
