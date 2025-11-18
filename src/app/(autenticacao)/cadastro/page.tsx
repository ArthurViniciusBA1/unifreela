import { ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import RegistroForm from './form';

export default function PaginaCadastro() {
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
              Criar conta
            </h1>
            <p className='text-muted-foreground text-base'>
              Preencha seus dados para começar
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className='bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8 space-y-6'>
          <RegistroForm />
        </div>

        {/* Footer Links */}
        <div className='text-center space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Já tem uma conta?{' '}
            <Link
              href='/entrar'
              className='text-primary hover:underline font-medium transition-colors'
            >
              Fazer login
            </Link>
          </p>
          <div className='pt-4 border-t border-border'>
            <Button asChild variant='outline' className='w-full'>
              <Link href='/entrar'>
                <LogIn className='mr-2 h-4 w-4' />
                Entrar na minha conta
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
