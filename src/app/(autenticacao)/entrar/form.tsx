'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { LogIn } from 'lucide-react';

import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { loginSchema, tLogin } from '@/schemas/usuarioSchema';

export default function FormLogin() {
  const router = useRouter();

  const form = useForm<tLogin>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (data: tLogin) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error?.form || result.error || 'E-mail ou senha inválidos.');
        return;
      }

      toast.success('Login realizado com sucesso!');
      router.push('/');
    } catch (error) {
      console.error('Erro no login do candidato:', error);
      toast.error('Erro ao tentar fazer login. Tente novamente.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput label='E-mail' id='email' type='email' autoComplete='username' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='senha'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput label='Senha' id='senhaLogin' type='password' autoComplete='current-password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type='submit' 
          disabled={form.formState.isSubmitting} 
          variant='default' 
          size='lg'
          className='w-full cursor-pointer mt-2'
        >
          {form.formState.isSubmitting ? (
            <>
              <span className='mr-2'>Entrando...</span>
            </>
          ) : (
            <>
              <LogIn className='mr-2 h-4 w-4' />
              Entrar
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
