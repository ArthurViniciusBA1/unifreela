'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Layers3, PenLine, Send, Sparkles } from 'lucide-react';

import { LogoutButton } from '@/components/auth/LogoutButton';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ModeToggle';
import { useUserMode } from '@/context/UserModeContext';
import { cn } from '@/lib/utils';

const freelancerLinks = [
  { href: '/candidato/projetos', label: 'Buscar Projetos', icon: Sparkles },
  { href: '/candidato/candidaturas', label: 'Minhas Propostas', icon: Send },
];

const clienteLinks = [
  { href: '/empresa/projetos', label: 'Projetos Criados', icon: Layers3 },
  { href: '/empresa/projetos/novo', label: 'Publicar Projeto', icon: PenLine },
];

export function EmpresaNavbar() {
  const pathname = usePathname();
  const { currentMode } = useUserMode();

  const navLinks = currentMode === 'CLIENTE' ? clienteLinks : freelancerLinks;

  return (
    <nav className='sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur'>
      <div className='container mx-auto flex max-w-screen-xl flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-center gap-3'>
          <Building2 size={28} className='text-primary' />
          <div>
            <p className='text-sm uppercase text-muted-foreground tracking-widest'>UniFreela</p>
            <p className='text-lg font-semibold text-foreground'>Portal Unificado</p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3 md:justify-end'>
          <ModeToggle />
          <div className='flex flex-wrap items-center gap-2'>
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Button key={link.href} asChild variant={isActive ? 'secondary' : 'ghost'} size='sm' className='px-3'>
                  <Link href={link.href} className={cn('flex items-center gap-2')}>
                    <link.icon size={16} />
                    <span className='hidden sm:inline'>{link.label}</span>
                  </Link>
                </Button>
              );
            })}
          </div>
          <LogoutButton variant='outline' size='sm' className='hover:bg-destructive hover:text-destructive-foreground' />
        </div>
      </div>
    </nav>
  );
}
