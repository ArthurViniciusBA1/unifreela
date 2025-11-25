'use client';

import {
  ArrowRight,
  Briefcase,
  Laptop2,
  LogIn,
  UserPlus,
  Users,
  Building2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { useUserMode } from '@/context/UserModeContext';

function HomeNavbar({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (isAuthenticated) {
    return null;
  }

  return (
    <nav className='w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
      <Link href='/' className='flex items-center gap-2'>
        <Image
          src={'/LogoUniVagas.png'}
          width={40}
          height={40}
          alt={'Logo UniVagas'}
        />
        <span className='text-lg font-semibold text-foreground'>UniFreela</span>
      </Link>
      <div className='flex items-center gap-3'>
        <Button asChild variant='ghost'>
          <Link href='/entrar'>
            <LogIn className='mr-2 h-4 w-4' />
            Entrar
          </Link>
        </Button>
        <Button asChild>
          <Link href='/cadastro'>
            <UserPlus className='mr-2 h-4 w-4' />
            Criar conta
          </Link>
        </Button>
      </div>
    </nav>
  );
}

function CTAButtons({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { setMode } = useUserMode();
  const router = useRouter();

  const handleFreelancerClick = () => {
    setMode('FREELANCER');
    if (isAuthenticated) {
      router.push('/projetos');
    } else {
      router.push('/entrar');
    }
  };

  const handleClienteClick = () => {
    setMode('CLIENTE');
    if (isAuthenticated) {
      router.push('/projetos');
    } else {
      router.push('/entrar');
    }
  };

  if (isAuthenticated) {
    return (
      <div className='grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2'>
        <button
          onClick={handleFreelancerClick}
          className='group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg text-left'
        >
          <div>
            <h3 className='text-xl font-semibold'>Quero trabalhar</h3>
            <p className='text-xs uppercase text-muted-foreground'>
              Buscar vagas
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              Encontre oportunidades de trabalho
            </p>
          </div>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0'>
            <Laptop2 size={22} />
          </div>
          <ArrowRight
            size={18}
            className='text-muted-foreground transition group-hover:translate-x-1 shrink-0'
          />
        </button>

        <button
          onClick={handleClienteClick}
          className='group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg text-left'
        >
          <div>
            <p className='text-xs uppercase text-muted-foreground'>
              Quero contratar
            </p>
            <h3 className='text-xl font-semibold'>Gerenciar projetos</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Publique e gerencie seus projetos
            </p>
          </div>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary-foreground shrink-0'>
            <Briefcase size={22} />
          </div>
          <ArrowRight
            size={18}
            className='text-muted-foreground transition group-hover:translate-x-1 shrink-0'
          />
        </button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center gap-6 w-full max-w-2xl'>
      <div className='grid w-full grid-cols-1 gap-4 sm:grid-cols-2'>
        <button
          onClick={handleFreelancerClick}
          className='group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg text-left'
        >
          <div>
            <h3 className='text-xl font-semibold'>Quero trabalhar</h3>
            <p className='text-xs uppercase text-muted-foreground'>
              Encontrar vagas
            </p>

            <p className='text-sm text-muted-foreground mt-1'>
              Encontre oportunidades de trabalho
            </p>
          </div>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0'>
            <Laptop2 size={22} />
          </div>
          <ArrowRight
            size={18}
            className='text-muted-foreground transition group-hover:translate-x-1 shrink-0'
          />
        </button>

        <button
          onClick={handleClienteClick}
          className='group flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-6 py-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg text-left'
        >
          <div>
            <h3 className='text-xl font-semibold'>Quero contratar</h3>
            <p className='text-xs uppercase text-muted-foreground'>
              Publicar vagas
            </p>
            <p className='text-sm text-muted-foreground mt-1'>
              Contrate freelancers qualificados
            </p>
          </div>
          <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0'>
            <Briefcase size={22} />
          </div>
          <ArrowRight
            size={18}
            className='text-muted-foreground transition group-hover:translate-x-1 shrink-0'
          />
        </button>
      </div>

      <div className='flex flex-col sm:flex-row gap-3 w-full mt-2'>
        <Button asChild size='lg' variant='outline' className='flex-1'>
          <Link href='/entrar'>
            <LogIn className='mr-2 h-4 w-4' />
            Já tenho conta
          </Link>
        </Button>
        <Button asChild size='lg' className='flex-1'>
          <Link href='/cadastro'>
            <UserPlus className='mr-2 h-4 w-4' />
            Criar conta gratuita
          </Link>
        </Button>
      </div>

      <p className='text-sm text-muted-foreground mt-2'>
        Não tem conta?{' '}
        <Link
          href='/cadastro'
          className='text-primary hover:underline font-medium'
        >
          Cadastre-se gratuitamente
        </Link>{' '}
        e comece agora mesmo!
      </p>
    </div>
  );
}

export function HomeClient({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <HomeNavbar isAuthenticated={isAuthenticated} />

      <main className='flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-background/80 px-4 pb-16 pt-6 sm:pt-10'>
        <div className='flex w-full max-w-5xl flex-col items-center gap-8 sm:gap-10 text-center'>
          {isAuthenticated && (
            <div className='w-full flex justify-center max-w-4xl'>
              <ModeToggle />
            </div>
          )}

          <div className='flex flex-col items-center gap-6 w-full'>
            <div className='relative'>
              <Image
                src={'/LogoUniVagas.png'}
                width={isAuthenticated ? 100 : 140}
                height={isAuthenticated ? 100 : 140}
                alt={'Logo UniVagas'}
                priority
                className='transition-opacity duration-700'
              />
            </div>
            <div className='space-y-4 transition-all duration-700'>
              <p className='text-sm font-semibold tracking-[0.4em] text-primary/70 uppercase'>
                UniFreela
              </p>
              <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground'>
                {isAuthenticated
                  ? 'Bem-vindo ao Portal Unificado'
                  : 'Conectamos talentos freelancers a clientes em uma única plataforma.'}
              </h1>
              <p className='text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto'>
                {isAuthenticated
                  ? 'Use o toggle acima para alternar entre visualização de freelancer e cliente. Gerencie projetos, propostas e encontre profissionais em um só lugar.'
                  : 'Uma única conta para trabalhar como freelancer e contratar profissionais. Publique projetos, envie propostas e acompanhe tudo em uma plataforma unificada.'}
              </p>
            </div>
          </div>

          <div className='w-full flex justify-center transition-all duration-700'>
            <CTAButtons isAuthenticated={isAuthenticated} />
          </div>

          {!isAuthenticated && (
            <>
              <div className='mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl transition-all duration-700'>
                <div className='flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card/50 hover:bg-card/80 transition-colors'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Users className='h-6 w-6' />
                  </div>
                  <h3 className='font-semibold text-lg'>Portal Unificado</h3>
                  <p className='text-sm text-muted-foreground text-center'>
                    Uma única conta para ser freelancer e cliente. Sem
                    complicação.
                  </p>
                </div>
                <div className='flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card/50 hover:bg-card/80 transition-colors'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Briefcase className='h-6 w-6' />
                  </div>
                  <h3 className='font-semibold text-lg'>Projetos Flexíveis</h3>
                  <p className='text-sm text-muted-foreground text-center'>
                    Publique projetos ou encontre oportunidades. Tudo em um só
                    lugar.
                  </p>
                </div>
                <div className='flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card/50 hover:bg-card/80 transition-colors'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Laptop2 className='h-6 w-6' />
                  </div>
                  <h3 className='font-semibold text-lg'>Gestão Completa</h3>
                  <p className='text-sm text-muted-foreground text-center'>
                    Gerencie propostas, projetos e encontre profissionais
                    qualificados.
                  </p>
                </div>
              </div>

              <div className='mt-8 sm:mt-12 p-6 sm:p-8 rounded-2xl border border-primary/20 bg-primary/5 w-full max-w-2xl transition-all duration-700'>
                <div className='flex flex-col items-center gap-4 sm:gap-6 text-center'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0'>
                    <Building2 className='h-8 w-8' />
                  </div>
                  <div className='flex flex-col items-center'>
                    <h3 className='text-xl font-bold mb-2'>
                      Pronto para começar?
                    </h3>
                    <p className='text-muted-foreground mb-4 max-w-md'>
                      Crie sua conta gratuitamente e tenha acesso a todas as
                      funcionalidades da plataforma.
                    </p>
                    <Button asChild size='lg' className='w-full sm:w-auto'>
                      <Link href='/cadastro'>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Criar conta agora
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
