'use client';

import { Briefcase, Laptop2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useUserMode, UserMode } from '@/context/UserModeContext';
import { cn } from '@/lib/utils';

const modes: { label: string; value: UserMode; icon: typeof Briefcase }[] = [
  { label: 'Quero Trabalhar', value: 'FREELANCER', icon: Laptop2 },
  { label: 'Quero Contratar', value: 'CLIENTE', icon: Briefcase },
];

export function ModeToggle() {
  const { currentMode, setMode, isReady } = useUserMode();

  return (
    <div className='flex gap-2 rounded-full border bg-background/80 px-1 py-1'>
      {modes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type='button'
          variant={currentMode === value ? 'default' : 'ghost'}
          size='sm'
          className={cn(
            'rounded-full px-4 transition-all',
            !isReady && 'opacity-50 pointer-events-none',
            currentMode === value && 'shadow-lg'
          )}
          onClick={() => setMode(value)}
        >
          <Icon size={16} className='mr-2' />
          {label}
        </Button>
      ))}
    </div>
  );
}
