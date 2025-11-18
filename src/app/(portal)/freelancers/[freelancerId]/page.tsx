import { notFound } from 'next/navigation';
import { ArrowLeft, FileWarning, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';

import { fetchFreelancerDetalhes } from '@/actions/freelancerActions';
import { Button } from '@/components/ui/button';
import { ResumeDisplay } from '@/components/empresa/ResumeDisplay';

export default async function PaginaDetalheFreelancer({
  params,
}: {
  params: Promise<{ freelancerId: string }>;
}) {
  const { freelancerId } = await params;
  const result = await fetchFreelancerDetalhes(freelancerId);

  if (!result.success || !result.freelancer) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4'>
        <FileWarning size={64} className='text-destructive mb-4' />
        <h1 className='text-3xl font-bold mb-2'>Erro ao Carregar Freelancer</h1>
        <p className='text-muted-foreground'>{result.error || 'O freelancer não foi encontrado.'}</p>
        <Button asChild className='mt-4'>
          <Link href='/freelancers'>Voltar para Freelancers</Link>
        </Button>
      </div>
    );
  }

  const { freelancer } = result;
  const usuario = freelancer.usuario;

  return (
    <div className='max-w-4xl mx-auto'>
      <div className='mb-6'>
        <Button asChild variant='outline'>
          <Link href='/freelancers'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para Freelancers
          </Link>
        </Button>
      </div>

      <div className='bg-card border rounded-lg p-6 mb-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-primary mb-2'>{usuario.nome}</h1>
          <p className='text-lg text-muted-foreground'>{freelancer.tituloProfissional}</p>
          <div className='text-sm text-gray-600 flex flex-wrap items-center gap-x-4 gap-y-1 mt-4'>
            {usuario.email && (
              <span className='flex items-center gap-2'>
                <Mail size={14} /> {usuario.email}
              </span>
            )}
            {freelancer.telefone && (
              <span className='flex items-center gap-2'>
                <Phone size={14} /> {freelancer.telefone}
              </span>
            )}
            {freelancer.endereco && (
              <span className='flex items-center gap-2'>
                <MapPin size={14} /> {freelancer.endereco}
              </span>
            )}
          </div>
          <div className='flex items-center gap-4 mt-3'>
            {freelancer.linkedinUrl && (
              <Link href={freelancer.linkedinUrl} target='_blank' rel='noopener noreferrer'>
                <Linkedin className='text-blue-700' size={20} />
              </Link>
            )}
            {freelancer.githubUrl && (
              <Link href={freelancer.githubUrl} target='_blank' rel='noopener noreferrer'>
                <Github className='text-gray-800' size={20} />
              </Link>
            )}
            {freelancer.portfolioUrl && (
              <Link href={freelancer.portfolioUrl} target='_blank' rel='noopener noreferrer'>
                <span className='text-sm text-primary hover:underline'>Portfolio</span>
              </Link>
            )}
          </div>
        </div>

        {freelancer.resumo && (
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-2'>Resumo Profissional</h2>
            <p className='text-gray-700 whitespace-pre-line leading-relaxed'>{freelancer.resumo}</p>
          </div>
        )}

        {freelancer.valorHora && (
          <div className='mb-6'>
            <p className='text-sm text-muted-foreground'>Valor por hora</p>
            <p className='text-lg font-semibold'>
              R$ {Number(freelancer.valorHora).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        )}
      </div>

      <ResumeDisplay curriculo={freelancer} />
    </div>
  );
}

