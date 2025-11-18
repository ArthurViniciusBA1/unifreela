import { BriefcaseBusiness } from 'lucide-react';

import { ProjetoForm } from '@/components/empresa/ProjetoForm';

export default function CriarProjetoPage() {
  return (
    <div className='max-w-3xl mx-auto bg-card border border-border rounded-lg p-6 sm:p-8 shadow-lg my-8'>
      <header className='mb-8 md:mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3'>
          <BriefcaseBusiness size={32} /> Publicar Novo Projeto
        </h1>
        <p className='text-lg text-muted-foreground mt-1'>
          Descreva seu projeto e conecte-se com freelancers qualificados.
        </p>
      </header>

      <ProjetoForm />
    </div>
  );
}
