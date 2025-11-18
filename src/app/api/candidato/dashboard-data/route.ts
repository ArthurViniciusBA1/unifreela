import { RoleUsuario } from '@prisma/client';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

interface TokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

interface ApiCurriculoResumo {
  id?: string;
  tituloCurriculo?: string;
  resumoProfissional?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  temInformacoesPessoais?: boolean;
  numExperiencias?: number;
  numFormacoes?: number;
  numHabilidades?: number;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json(
      { error: 'Configuração do servidor incompleta.' },
      { status: 500 }
    );
  }
  if (!token) {
    return NextResponse.json(
      { error: 'Usuário não autenticado.' },
      { status: 401 }
    );
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    if (
      !decodedToken?.id ||
      (decodedToken.role !== RoleUsuario.USER &&
        decodedToken.role !== RoleUsuario.ADMIN)
    ) {
      return NextResponse.json(
        { error: 'Acesso não autorizado.' },
        { status: 403 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decodedToken.id },
      select: { id: true, nome: true, email: true, numeroRA: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    const curriculoPrisma = await prisma.curriculo.findUnique({
      where: { usuarioId: usuario.id },
      select: {
        id: true,
        tituloProfissional: true,
        resumo: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
        _count: {
          select: {
            experiencias: true,
            formacoes: true,
            habilidades: true,
          },
        },
      },
    });

    let curriculoResumoParaFrontend: ApiCurriculoResumo | null = null;

    if (curriculoPrisma) {
      curriculoResumoParaFrontend = {
        id: curriculoPrisma.id,
        tituloCurriculo: curriculoPrisma.tituloProfissional ?? undefined,
        resumoProfissional: curriculoPrisma.resumo ?? undefined,
        linkedinUrl: curriculoPrisma.linkedinUrl ?? undefined,
        githubUrl: curriculoPrisma.githubUrl ?? undefined,
        portfolioUrl: curriculoPrisma.portfolioUrl ?? undefined,
        temInformacoesPessoais: !!(
          curriculoPrisma.tituloProfissional || curriculoPrisma.id
        ),
        numExperiencias: curriculoPrisma._count?.experiencias || 0,
        numFormacoes: curriculoPrisma._count?.formacoes || 0,
        numHabilidades: curriculoPrisma._count?.habilidades || 0,
      };
    }

    return NextResponse.json({
      usuario,
      curriculoResumo: curriculoResumoParaFrontend,
    });
  } catch (error) {
    console.error('API Error /api/candidato/dashboard-data:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard.' },
      { status: 500 }
    );
  }
}
