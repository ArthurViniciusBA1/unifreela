'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

import { updateClienteAction } from '@/actions/clienteActions';
import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { clienteFormSchema, tClienteForm } from '@/schemas/clienteSchema';

export function ClienteProfileForm({ initialData }: { initialData: any }) {
  const form = useForm<tClienteForm>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      id: initialData?.id || '',
      nomeFantasia: initialData?.nomeFantasia || '',
      descricao: initialData?.descricao || '',
      cpfOuCnpj: initialData?.cpfOuCnpj || '',
      websiteUrl: initialData?.websiteUrl || '',
      localizacao: initialData?.localizacao || '',
    },
  });

  const onSubmit = async (data: tClienteForm) => {
    const toastId = toast.loading('Salvando alterações...');
    const result = await updateClienteAction(data);

    if (result.success) {
      toast.success('Perfil da empresa atualizado com sucesso!', { id: toastId });
    } else {
      toast.error(result.error || 'Falha ao salvar.', { id: toastId });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='nomeFantasia'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Nome / Organização' id='nomeFantasia' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='descricao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea
                  label='Descrição do cliente / negócios'
                  id='descricao'
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='cpfOuCnpj'
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF ou CNPJ (somente números)</FormLabel>
              <FormControl>
                <FloatingLabelInput
                  id='cpfOuCnpj'
                  inputMode='numeric'
                  {...field}
                  onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='websiteUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Website URL' id='websiteUrl' type='url' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='localizacao'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Localização principal' id='localizacao' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end gap-4 pt-4'>
          <Button type='button' variant='outline' asChild>
            <Link href='/perfil'>Cancelar</Link>
          </Button>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : (
              <Save className='mr-2 h-4 w-4' />
            )}
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Form>
  );
}
