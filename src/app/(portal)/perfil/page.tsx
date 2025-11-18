import { Building2, FileWarning, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { fetchClientePerfil } from '@/actions/clienteActions';
import { ClienteProfileForm } from '@/components/empresa/ClienteProfileForm';
import { PerfilFreelancerSection } from './PerfilFreelancerSection';

export default async function PaginaPerfil() {
  const { cliente, error: clienteError } = await fetchClientePerfil();

  return (
    <div className='max-w-4xl mx-auto'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <User size={32} /> Meu Perfil
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Gerencie seus perfis de cliente e freelancer.
        </p>
      </header>

      <Tabs defaultValue='freelancer' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='freelancer'>
            <User className='mr-2 h-4 w-4' />
            Perfil Freelancer
          </TabsTrigger>
          <TabsTrigger value='cliente'>
            <Building2 className='mr-2 h-4 w-4' />
            Perfil Cliente
          </TabsTrigger>
        </TabsList>

        <TabsContent value='freelancer' className='mt-6'>
          <div className='bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg'>
            <PerfilFreelancerSection />
          </div>
        </TabsContent>

        <TabsContent value='cliente' className='mt-6'>
          <div className='bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg'>
            {clienteError || !cliente ? (
              <div className='flex flex-col items-center justify-center text-center p-8'>
                <FileWarning size={48} className='text-destructive mb-4' />
                <h2 className='text-2xl font-bold mb-2'>
                  Erro ao Carregar Perfil
                </h2>
                <p className='text-muted-foreground'>
                  {clienteError ||
                    'Não foi possível encontrar os dados do cliente.'}
                </p>
              </div>
            ) : (
              <>
                <h2 className='text-2xl font-bold text-foreground mb-4 flex items-center gap-2'>
                  <Building2 size={24} /> Perfil do Cliente
                </h2>
                <p className='text-muted-foreground mb-6'>
                  Mantenha seus dados sempre atualizados.
                </p>
                <ClienteProfileForm initialData={cliente} />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
