'use server';

import { Prisma, RoleUsuario } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { authorizeUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma';

interface FetchFreelancersResult {
  success: boolean;
  error?: string;
  freelancers?: any[];
  total?: number;
}

interface FetchFreelancerDetalhesResult {
  success: boolean;
  error?: string;
  freelancer?: any;
}

export async function fetchFreelancersDisponiveis(params: { page?: number; limit?: number } = {}): Promise<FetchFreelancersResult> {
  const { page = 1, limit = 9 } = params;
  const skip = (page - 1) * limit;

  const { isAuthorized } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);
  if (!isAuthorized) {
    return { success: false, error: 'Acesso negado. Faça login para visualizar freelancers.' };
  }

  try {
    const whereClause: Prisma.CurriculoWhereInput = {
      disponivel: true,
    };

    const [freelancers, total] = await prisma.$transaction([
      prisma.curriculo.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              email: true,
              fotoUrl: true,
            },
          },
          habilidades: {
            select: {
              nome: true,
            },
            take: 5,
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.curriculo.count({ where: whereClause }),
    ]);

    return { success: true, freelancers, total };
  } catch (error) {
    console.error('Erro ao listar freelancers disponíveis:', error);
    return { success: false, error: 'Não foi possível carregar os freelancers no momento.' };
  }
}

export async function fetchFreelancerDetalhes(freelancerId: string): Promise<FetchFreelancerDetalhesResult> {
  const { isAuthorized } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);
  if (!isAuthorized) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const freelancer = await prisma.curriculo.findUnique({
      where: { id: freelancerId },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            fotoUrl: true,
          },
        },
        experienciasProfissionais: {
          orderBy: { dataInicio: 'desc' },
        },
        formacoesAcademicas: {
          orderBy: { dataInicio: 'desc' },
        },
        habilidades: {
          orderBy: { nome: 'asc' },
        },
        idiomas: {
          orderBy: { nome: 'asc' },
        },
        projetos: {
          orderBy: { nome: 'asc' },
        },
        certificacoes: {
          orderBy: { dataEmissao: 'desc' },
        },
      },
    });

    if (!freelancer) {
      return { success: false, error: 'Freelancer não encontrado.' };
    }

    return { success: true, freelancer };
  } catch (error) {
    console.error('Erro ao buscar detalhes do freelancer:', error);
    return { success: false, error: 'Não foi possível carregar os detalhes do freelancer.' };
  }
}

