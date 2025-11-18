'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { UserPlus } from 'lucide-react';

import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cadastroSchema, tCadastro } from '@/schemas/usuarioSchema';

export default function RegistroForm() {
  const form = useForm<tCadastro>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const router = useRouter();
  const delayRedirectEmMs = 3000;

  const onSubmit = async (data: tCadastro) => {
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error?.form) {
          toast.error(result.error.form);
        } else if (result.error?.email) {
          form.setError('email', {
            message: result.error.email._errors.join(', '),
          });
        } else {
          toast.error(result.error || 'Falha ao cadastrar. Tente novamente.');
        }
        return;
      }

      toast.success(
        `Cadastro de ${result.usuario?.nome || 'usuário'} realizado com sucesso! Redirecionando para login...`
      );
      form.reset();

      setTimeout(() => {
        router.push('/entrar');
      }, delayRedirectEmMs);
    } catch (error) {
      console.error('Erro ao submeter formulário de cadastro:', error);
      toast.error('Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='w-full flex flex-col gap-6'
      >
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='nome'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='Nome completo'
                    id='nome'
                    autoComplete='name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='E-mail'
                    id='email'
                    type='email'
                    autoComplete='email'
                    {...field}
                  />
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
                  <FloatingLabelInput
                    label='Senha'
                    id='senha'
                    type='password'
                    autoComplete='new-password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmarSenha'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='Confirmar senha'
                    id='confirmarSenha'
                    type='password'
                    autoComplete='new-password'
                    {...field}
                  />
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
              <span className='mr-2'>Criando conta...</span>
            </>
          ) : (
            <>
              <UserPlus className='mr-2 h-4 w-4' />
              Criar conta
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
