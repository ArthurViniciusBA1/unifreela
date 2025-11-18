import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import FormLogin from './form';

export default function PaginaEntrar() {
  return (
    <main className='relative w-full flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4'>
      <Link
        href='/'
        className='absolute left-4 top-4 md:left-6 md:top-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors'
        aria-label='Voltar para a página inicial'
      >
        <ArrowLeft size={20} />
        <span className='text-sm hidden sm:inline'>Voltar</span>
      </Link>

      <div className='w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <div className='flex justify-center mb-4'>
            <div className='relative'>
              <Image
                src={'/LogoUniVagas.png'}
                width={80}
                height={80}
                alt={'Logo UniVagas'}
                priority
                className='transition-opacity duration-300'
              />
            </div>
          </div>
          <div>
            <h1 className='text-3xl sm:text-4xl font-bold text-foreground mb-2'>
              Bem-vindo de volta
            </h1>
            <p className='text-muted-foreground text-base'>
              Entre na sua conta para continuar
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className='bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-6'>
          <FormLogin />
        </div>

        {/* Footer Links */}
        <div className='text-center space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Não tem uma conta?{' '}
            <Link
              href='/cadastro'
              className='text-primary hover:underline font-medium transition-colors'
            >
              Criar conta gratuita
            </Link>
          </p>
          <div className='pt-4 border-t border-border'>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/cadastro'>
                <UserPlus className='mr-2 h-4 w-4' />
                Criar nova conta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
