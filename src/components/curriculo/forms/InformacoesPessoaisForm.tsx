'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FloatingLabelInput } from '@/components/custom/FloatingLabelInput';
import { FloatingLabelTextarea } from '@/components/custom/FloatingLabelTextarea';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCandidato } from '@/context/CandidatoContext';
import {
  curriculoInformacoesPessoaisSchema,
  tCurriculoInformacoesPessoais,
} from '@/schemas/curriculoSchema';

interface InformacoesPessoaisFormProps {
  setModalOpen: (isOpen: boolean) => void;
}

export function InformacoesPessoaisForm({ setModalOpen }: InformacoesPessoaisFormProps) {
  const { curriculo, updateInformacoesPessoais } = useCandidato();

  const form = useForm<tCurriculoInformacoesPessoais>({
    resolver: zodResolver(curriculoInformacoesPessoaisSchema),
    defaultValues: {
      tituloProfissional: '',
      resumo: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
    },
  });

  useEffect(() => {
    if (curriculo) {
      form.reset({
        tituloProfissional: curriculo.tituloProfissional ?? '',
        resumo: curriculo.resumo ?? '',
        linkedinUrl: curriculo.linkedinUrl ?? '',
        githubUrl: curriculo.githubUrl ?? '',
        portfolioUrl: curriculo.portfolioUrl ?? '',
      });
    }
  }, [curriculo, form]);

  const onSubmit = async (data: tCurriculoInformacoesPessoais) => {
    try {
      await updateInformacoesPessoais(data);
      setModalOpen(false);
    } catch (error) {
      console.error('Falha ao submeter o formulário de informações pessoais:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
        <FormField
          control={form.control}
          name='tituloProfissional'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput label='Título Profissional' id='tituloProfissionalModal' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='resumo'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelTextarea
                  label='Resumo Profissional / Sobre Mim'
                  id='resumoModal'
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
          name='linkedinUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='URL do LinkedIn (opcional)'
                  id='linkedinUrlModal'
                  type='url'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='githubUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='URL do GitHub (opcional)'
                  id='githubUrlModal'
                  type='url'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='portfolioUrl'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FloatingLabelInput
                  label='URL do Portfólio (opcional)'
                  id='portfolioUrlModal'
                  type='url'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className='pt-4'>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancelar
            </Button>
          </DialogClose>
          <Button type='submit' disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Salvando...
              </>
            ) : (
              'Salvar Informações'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
