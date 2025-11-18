'use server';

import { Prisma, RoleUsuario, StatusProposta } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { authorizeUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma';
import { propostaFormSchema, tPropostaForm } from '@/schemas/propostaSchema';

interface FetchPropostasResult {
  success: boolean;
  error?: string;
  propostas?: any[];
}

interface ActionResult {
  success: boolean;
  error?: string;
  proposta?: any;
}

async function ensureFreelancerPerfil(userId: string) {
  const curriculo = await prisma.curriculo.findUnique({
    where: { usuarioId: userId },
    select: { id: true },
  });
  return curriculo?.id ?? null;
}

export async function fetchUserPropostas(
  status?: StatusProposta | 'TODOS'
): Promise<FetchPropostasResult> {
  const { isAuthorized, userId } = await authorizeUser([
    RoleUsuario.USER,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const whereClause: Prisma.PropostaWhereInput = {
      freelancerId: userId,
    };

    if (status && status !== 'TODOS') {
      whereClause.status = status;
    }

    const propostas = await prisma.proposta.findMany({
      where: whereClause,
      include: {
        projeto: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, propostas };
  } catch (error) {
    console.error('Erro ao buscar propostas:', error);
    return {
      success: false,
      error: 'Não foi possível carregar suas propostas.',
    };
  }
}

export async function enviarPropostaAction(
  payload: tPropostaForm
): Promise<ActionResult> {
  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.USER]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  const parseResult = propostaFormSchema.safeParse(payload);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors.map((err) => err.message).join(', '),
    };
  }

  const freelancerPerfilId = await ensureFreelancerPerfil(userId);
  if (!freelancerPerfilId) {
    return {
      success: false,
      error: 'Complete seu perfil de freelancer para enviar propostas.',
    };
  }

  try {
    const valorDecimal = new Prisma.Decimal(
      parseResult.data.valor.replace(',', '.')
    );

    const proposta = await prisma.proposta.create({
      data: {
        mensagem: parseResult.data.mensagem,
        valorProposto: valorDecimal,
        prazoEstimadoDias: parseResult.data.prazoEstimadoDias,
        status: parseResult.data.status ?? StatusProposta.ENVIADA,
        freelancerId: userId,
        projetoId: parseResult.data.projetoId,
      },
    });

    revalidatePath('/propostas');
    return { success: true, proposta };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return {
        success: false,
        error: 'Você já enviou uma proposta para este projeto.',
      };
    }
    console.error('Erro ao enviar proposta:', error);
    return { success: false, error: 'Não foi possível enviar a proposta.' };
  }
}

export async function fetchPropostasDoCliente(
  filters: { status?: StatusProposta | 'TODOS'; projetoId?: string } = {}
): Promise<FetchPropostasResult> {
  const { isAuthorized, userId } = await authorizeUser([
    RoleUsuario.USER,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const whereClause: Prisma.PropostaWhereInput = {};

    if (filters.status && filters.status !== 'TODOS') {
      whereClause.status = filters.status;
    }

    if (filters.projetoId) {
      whereClause.projetoId = filters.projetoId;
    }

    const propostas = await prisma.proposta.findMany({
      where: {
        ...whereClause,
        projeto: {
          criadoPorId: userId,
        },
      },
      include: {
        projeto: true,
        freelancer: {
          select: {
            nome: true,
            email: true,
            perfilFreelancer: {
              select: {
                id: true,
                tituloProfissional: true,
                linkedinUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, propostas };
  } catch (error) {
    console.error('Erro ao buscar propostas para o cliente:', error);
    return { success: false, error: 'Não foi possível carregar as propostas.' };
  }
}

export async function atualizarStatusPropostaAction(
  propostaId: string,
  status: StatusProposta
) {
  const { isAuthorized, userId } = await authorizeUser([
    RoleUsuario.USER,
    RoleUsuario.ADMIN,
  ]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const proposta = await prisma.proposta.findUnique({
      where: { id: propostaId },
      select: { projeto: { select: { criadoPorId: true } } },
    });

    if (!proposta || proposta.projeto.criadoPorId !== userId) {
      return { success: false, error: 'Você não pode alterar esta proposta.' };
    }

    const atualizada = await prisma.proposta.update({
      where: { id: propostaId },
      data: { status },
    });

    revalidatePath('/propostas');
    return { success: true, proposta: atualizada };
  } catch (error) {
    console.error('Erro ao atualizar status da proposta:', error);
    return { success: false, error: 'Não foi possível atualizar o status.' };
  }
}

export async function cancelarPropostaAction(propostaId: string) {
  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.USER]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const proposta = await prisma.proposta.findFirst({
      where: { id: propostaId, freelancerId: userId },
    });

    if (!proposta) {
      return { success: false, error: 'Proposta não encontrada.' };
    }

    const statusPermitidos: StatusProposta[] = [
      StatusProposta.ENVIADA,
      StatusProposta.EM_NEGOCIACAO,
    ];
    if (!statusPermitidos.includes(proposta.status)) {
      return {
        success: false,
        error: 'Não é possível cancelar esta proposta.',
      };
    }

    await prisma.proposta.delete({ where: { id: propostaId } });
    revalidatePath('/propostas');
    return { success: true };
  } catch (error) {
    console.error('Erro ao cancelar proposta:', error);
    return { success: false, error: 'Não foi possível cancelar a proposta.' };
  }
}

export async function fetchPropostaDetalhes(propostaId: string) {
  const { isAuthorized, userId } = await authorizeUser([
    RoleUsuario.USER,
    RoleUsuario.ADMIN,
  ]);
  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    // Permite acesso tanto para o cliente (dono do projeto) quanto para o freelancer (autor da proposta)
    const proposta = await prisma.proposta.findFirst({
      where: {
        id: propostaId,
        OR: [
          { projeto: { criadoPorId: userId } }, // Cliente
          { freelancerId: userId }, // Freelancer
        ],
      },
      include: {
        projeto: true,
        freelancer: {
          include: {
            perfilFreelancer: {
              include: {
                experiencias: { orderBy: { dataInicio: 'desc' } },
                formacoes: { orderBy: { dataInicio: 'desc' } },
                habilidades: { orderBy: { nome: 'asc' } },
                idiomas: { orderBy: { nome: 'asc' } },
                certificacoes: { orderBy: { dataEmissao: 'desc' } },
              },
            },
          },
        },
      },
    });

    if (!proposta) {
      return { success: false, error: 'Proposta não encontrada.' };
    }

    return { success: true, proposta };
  } catch (error) {
    console.error('Erro ao buscar detalhes da proposta:', error);
    return { success: false, error: 'Não foi possível carregar os detalhes.' };
  }
}
