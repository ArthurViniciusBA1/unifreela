'use server';

import { Prisma, RoleUsuario, StatusProjeto } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { authorizeUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma';
import { projetoFormSchema, tProjetoForm } from '@/schemas/projetoSchema';

const projetoWithClienteArgs = Prisma.validator<Prisma.ProjetoDefaultArgs>()({
  include: {
    criadoPor: {
      select: {
        id: true,
        nome: true,
        perfilCliente: {
          select: {
            nomeFantasia: true,
            descricao: true,
          },
        },
      },
    },
  },
});

export type ProjetoWithCliente = Prisma.ProjetoGetPayload<typeof projetoWithClienteArgs>;

interface FetchProjetosParams {
  page?: number;
  limit?: number;
  status?: StatusProjeto;
}

interface FetchProjetosResult {
  success: boolean;
  error?: string;
  projetos?: ProjetoWithCliente[];
  total?: number;
}

async function ensureClientePerfil(userId: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { perfilCliente: { select: { id: true } } },
  });
  return usuario?.perfilCliente?.id ?? null;
}

export async function fetchAvailableProjetos(params: FetchProjetosParams = {}): Promise<FetchProjetosResult> {
  const { page = 1, limit = 9, status = StatusProjeto.ABERTO } = params;
  const skip = (page - 1) * limit;

  const { isAuthorized } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);
  if (!isAuthorized) {
    return { success: false, error: 'Acesso negado. Faça login para visualizar projetos.' };
  }

  try {
    const whereClause: Prisma.ProjetoWhereInput = {
      status,
    };

    const [projetos, total] = await prisma.$transaction([
      prisma.projeto.findMany({
        where: whereClause,
        orderBy: { dataPublicacao: 'desc' },
        include: projetoWithClienteArgs.include,
        skip,
        take: limit,
      }),
      prisma.projeto.count({ where: whereClause }),
    ]);

    return { success: true, projetos, total };
  } catch (error) {
    console.error('Erro ao listar projetos disponíveis:', error);
    return { success: false, error: 'Não foi possível carregar os projetos no momento.' };
  }
}

export async function fetchProjetosDoCliente(params: FetchProjetosParams = {}): Promise<FetchProjetosResult> {
  const { page = 1, limit = 9 } = params;
  const skip = (page - 1) * limit;

  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  let clienteUserId = userId;
  if (params.status === StatusProjeto.ABERTO && isAuthorized) {
    // nothing extra, placeholder caso futuro
  }

  const clientePerfilId = await ensureClientePerfil(clienteUserId);
  if (!clientePerfilId) {
    return {
      success: false,
      error: 'Complete o perfil de cliente para gerenciar projetos.',
    };
  }

  try {
    const [projetos, total] = await prisma.$transaction([
      prisma.projeto.findMany({
        where: { criadoPorId: clienteUserId },
        orderBy: { dataPublicacao: 'desc' },
        include: projetoWithClienteArgs.include,
        skip,
        take: limit,
      }),
      prisma.projeto.count({ where: { criadoPorId: clienteUserId } }),
    ]);

    return { success: true, projetos, total };
  } catch (error) {
    console.error('Erro ao buscar projetos do cliente:', error);
    return { success: false, error: 'Não foi possível carregar seus projetos.' };
  }
}

export async function saveProjetoAction(formData: tProjetoForm) {
  const { isAuthorized, userId, role } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  const parsed = projetoFormSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const data = parsed.data;
  const habilidades = data.habilidadesDesejadas
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  let ownerId = userId;

  if (role === RoleUsuario.USER) {
    const clientePerfilId = await ensureClientePerfil(userId);
    if (!clientePerfilId) {
      return { success: false, error: 'Crie ou complete seu perfil de cliente para publicar projetos.' };
    }
  }

  try {
    if (data.id) {
      const existing = await prisma.projeto.findUnique({ where: { id: data.id } });
      if (!existing) {
        return { success: false, error: 'Projeto não encontrado.' };
      }
      if (role === RoleUsuario.USER && existing.criadoPorId !== ownerId) {
        return { success: false, error: 'Você não pode editar este projeto.' };
      }

      const projetoAtualizado = await prisma.projeto.update({
        where: { id: data.id },
        data: {
          titulo: data.titulo,
          descricao: data.descricao,
          habilidadesDesejadas: habilidades,
          tipo: data.tipo,
          status: data.status ?? existing.status,
          orcamentoEstimado: data.orcamentoEstimado || null,
          prazoEstimado: data.prazoEstimado || null,
          remoto: data.remoto,
        },
      });

      revalidatePath('/projetos');
      return { success: true, projeto: projetoAtualizado };
    }

    const projeto = await prisma.projeto.create({
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        habilidadesDesejadas: habilidades,
        tipo: data.tipo,
        status: data.status ?? StatusProjeto.ABERTO,
        orcamentoEstimado: data.orcamentoEstimado || null,
        prazoEstimado: data.prazoEstimado || null,
        remoto: data.remoto,
        criadoPorId: ownerId,
      },
    });

    revalidatePath('/projetos');

    return { success: true, projeto };
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    return { success: false, error: 'Não foi possível salvar o projeto.' };
  }
}

export async function fetchProjetoParaEdicao(projetoId: string) {
  const { isAuthorized, userId, role } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });
    if (!projeto) {
      return { success: false, error: 'Projeto não encontrado.' };
    }

    if (role === RoleUsuario.USER && projeto.criadoPorId !== userId) {
      return { success: false, error: 'Você não pode editar este projeto.' };
    }

    return {
      success: true,
      projeto: {
        ...projeto,
        habilidadesDesejadas: projeto.habilidadesDesejadas.join(', '),
      },
    };
  } catch (error) {
    console.error('Erro ao carregar projeto para edição:', error);
    return { success: false, error: 'Não foi possível carregar os dados do projeto.' };
  }
}

export async function alterarStatusProjetoAction(projetoId: string, status: StatusProjeto) {
  const { isAuthorized, userId, role } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const projeto = await prisma.projeto.findUnique({ where: { id: projetoId } });
    if (!projeto) {
      return { success: false, error: 'Projeto não encontrado.' };
    }

    if (role === RoleUsuario.USER && projeto.criadoPorId !== userId) {
      return { success: false, error: 'Você não pode alterar este projeto.' };
    }

    const atualizado = await prisma.projeto.update({
      where: { id: projetoId },
      data: { status },
    });

    revalidatePath('/empresa/projetos');
    revalidatePath('/empresa/dashboard');

    return { success: true, projeto: atualizado };
  } catch (error) {
    console.error('Erro ao alterar status do projeto:', error);
    return { success: false, error: 'Não foi possível alterar o status do projeto.' };
  }
}

