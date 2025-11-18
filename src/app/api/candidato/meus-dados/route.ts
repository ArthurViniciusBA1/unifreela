import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { RoleUsuario } from '@prisma/client';

interface TokenPayload extends JwtPayload {
  id: string;
  role?: RoleUsuario;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return NextResponse.json({ error: 'Configuração do servidor incompleta.' }, { status: 500 });
  }
  if (!token) {
    return NextResponse.json({ error: 'Usuário não autenticado.' }, { status: 401 });
  }

  try {
    const decodedToken = jwt.verify(token, jwtSecret) as TokenPayload;
    if (!decodedToken?.id || (decodedToken.role !== RoleUsuario.USER && decodedToken.role !== RoleUsuario.ADMIN)) {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    let curriculo;
    try {
      curriculo = await prisma.curriculo.findUnique({
        where: { usuarioId: usuario.id },
        include: {
          // Garantindo que todos os includes necessários para o tipo CurriculoCompleto estejam aqui
          usuario: { select: { id: true, nome: true, email: true } },
          experiencias: true,
          formacoes: true,
          habilidades: true,
          idiomas: true,
          certificacoes: true,
          projetosPortfolio: true,
        },
      });
    } catch (includeError) {
      // Se houver erro com projetosPortfolio, tenta sem ele
      console.warn('Erro ao incluir projetosPortfolio, tentando sem ele:', includeError);
      curriculo = await prisma.curriculo.findUnique({
        where: { usuarioId: usuario.id },
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
          experiencias: true,
          formacoes: true,
          habilidades: true,
          idiomas: true,
          certificacoes: true,
        },
      });
    }

    // Serializar campos Decimal para string para evitar erros de serialização JSON
    const serializedCurriculo = curriculo
      ? {
          ...curriculo,
          valorHora: curriculo.valorHora ? curriculo.valorHora.toString() : null,
        }
      : null;

    return NextResponse.json({ usuario, curriculo: serializedCurriculo });
  } catch (error) {
    console.error('API Error /api/candidato/meus-dados:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados do candidato.';
    console.error('Error details:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
