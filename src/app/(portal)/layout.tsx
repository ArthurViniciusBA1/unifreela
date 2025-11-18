import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { UnifiedNavbar } from '@/components/portal/UnifiedNavbar';
import { CandidatoProvider } from '@/context/CandidatoContext';

interface TokenPayload extends JwtPayload {
  id: string;
  nome?: string;
  role?: RoleUsuario;
  email?: string;
  empresaId?: string | null;
}

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('PortalLayout: JWT_SECRET não definido. Redirecionando...');
    redirect('/');
  }

  let tokenData: TokenPayload | null = null;

  if (token) {
    try {
      const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
      if (decodedToken?.id && (decodedToken.role === RoleUsuario.USER || decodedToken.role === RoleUsuario.ADMIN)) {
        tokenData = decodedToken;
      } else {
        console.warn(`PortalLayout: Tentativa de acesso por usuário com role '${decodedToken?.role}'.`);
      }
    } catch (error) {
      console.warn('PortalLayout: Token inválido ou expirado.', error);
    }
  }

  if (!tokenData) {
    const headersList = await headers();
    const originalPathname = headersList.get('x-next-pathname') || '/projetos';
    const errorMessage = encodeURIComponent('Acesso restrito. Por favor, faça login.');
    redirect(`/entrar?error=${errorMessage}&redirect=${encodeURIComponent(originalPathname)}`);
  }

  return (
    <CandidatoProvider>
      <div className='flex flex-col min-h-screen bg-background'>
        <UnifiedNavbar />
        <main className='flex-grow container mx-auto px-4 py-6 md:py-8 max-w-screen-xl'>{children}</main>
      </div>
    </CandidatoProvider>
  );
}

