'use client';

import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusProjeto, TipoProjeto } from '@prisma/client';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { saveProjetoAction } from '@/actions/projetoActions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tProjetoForm, projetoFormSchema } from '@/schemas/projetoSchema';

interface ProjetoFormProps {
  dadosIniciais?: Partial<tProjetoForm>;
}

export function ProjetoForm({ dadosIniciais }: ProjetoFormProps) {
  const router = useRouter();

  const defaultValues: tProjetoForm = useMemo(
    () => ({
      id: dadosIniciais?.id,
      titulo: dadosIniciais?.titulo ?? '',
      descricao: dadosIniciais?.descricao ?? '',
      habilidadesDesejadas: dadosIniciais?.habilidadesDesejadas ?? '',
      tipo: dadosIniciais?.tipo ?? TipoProjeto.PROJETO_FIXO,
      status: dadosIniciais?.status ?? StatusProjeto.ABERTO,
      orcamentoEstimado: dadosIniciais?.orcamentoEstimado ?? '',
      prazoEstimado: dadosIniciais?.prazoEstimado ?? '',
      remoto: dadosIniciais?.remoto ?? true,
    }),
    [dadosIniciais]
  );

  const form = useForm<tProjetoForm>({
    resolver: zodResolver(projetoFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: tProjetoForm) => {
    const toastId = toast.loading(
      dadosIniciais?.id ? 'Atualizando projeto...' : 'Publicando projeto...'
    );
    const result = await saveProjetoAction(data);

    if (result.success) {
      toast.success(
        dadosIniciais?.id
          ? 'Projeto atualizado com sucesso!'
          : 'Projeto publicado!',
        {
          id: toastId,
        }
      );
      router.push('/projetos');
      router.refresh();
    } else {
      toast.error(result.error || 'Não foi possível salvar o projeto.', {
        id: toastId,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='titulo'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='Título do Projeto'
                  id='tituloProjeto'
                  {...field}
                />
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
                  label='Descrição detalhada'
                  id='descricaoProjeto'
                  rows={8}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='habilidadesDesejadas'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea
                  label='Habilidades desejadas (separe por vírgula ou nova linha)'
                  id='habilidadesProjeto'
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='tipo'
            render={({ field }) => (
              <FormItem className='flex flex-col justify-end'>
                <FormLabel>Tipo de projeto</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecione o tipo de projeto' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(TipoProjeto).map((tipo) => (
                      <SelectItem
                        key={tipo}
                        value={tipo}
                        className='capitalize'
                      >
                        {tipo.replace(/_/g, ' ').toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='status'
            render={({ field }) => {
              // Ao criar novo projeto, só permite RASCUNHO ou ABERTO
              const statusDisponiveis = dadosIniciais?.id
                ? Object.values(StatusProjeto)
                : [StatusProjeto.RASCUNHO, StatusProjeto.ABERTO];

              return (
                <FormItem className='flex flex-col justify-end'>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecione o status' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusDisponiveis.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className='capitalize'
                        >
                          {status.replace(/_/g, ' ').toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <FormField
            control={form.control}
            name='orcamentoEstimado'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='Orçamento estimado (ex: R$ 5.000)'
                    id='orcamentoProjeto'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='prazoEstimado'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FloatingLabelInput
                    label='Prazo estimado (ex: 6 semanas)'
                    id='prazoProjeto'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='remoto'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm'>
              <FormControl>
                <input
                  type='checkbox'
                  id='remotoProjeto'
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary'
                />
              </FormControl>
              <div className='space-y-1 leading-none'>
                <FormLabel
                  htmlFor='remotoProjeto'
                  className='cursor-pointer font-medium'
                >
                  Projeto remoto
                </FormLabel>
                <p className='text-sm text-muted-foreground'>
                  Desmarque para indicar presença obrigatória.
                </p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-4 mt-8'>
          <Button type='button' variant='outline' asChild>
            <Link href='/projetos'>Cancelar</Link>
          </Button>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Salvando...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                {dadosIniciais?.id ? 'Salvar alterações' : 'Publicar projeto'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
