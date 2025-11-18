'use server';

import { RoleUsuario, StatusProposta, StatusProjeto } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { authorizeUser } from '@/lib/auth.server';
import { prisma } from '@/lib/prisma';
import { clienteFormSchema, tClienteForm } from '@/schemas/clienteSchema';

interface DashboardDataResult {
  success: boolean;
  error?: string;
  data?: {
    clienteNome: string;
    clienteDescricao: string | null;
    usuarioNome: string;
    usuarioEmail: string;
    totalProjetosAbertos: number;
    totalPropostasRecebidas: number;
    totalPropostasEmNegociacao: number;
    totalPropostasAceitas: number;
  };
}

interface FetchClienteResult {
  success: boolean;
  error?: string;
  cliente?: any;
}

interface UpdateClienteResult {
  success: boolean;
  error?: string;
  cliente?: any;
}

export async function fetchDashboardData(): Promise<DashboardDataResult> {
  const { isAuthorized, userId, role } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);

  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        nome: true,
        email: true,
        role: true,
        perfilCliente: {
          select: {
            id: true,
            nomeFantasia: true,
            descricao: true,
          },
        },
      },
    });

    if (!usuario) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const clientePerfil = usuario.perfilCliente;
    if (role === RoleUsuario.USER && !clientePerfil) {
      return { success: false, error: 'Complete seu perfil de cliente para acessar o dashboard.' };
    }

    let totalProjetosAbertos = 0;
    let totalPropostasRecebidas = 0;
    let totalPropostasEmNegociacao = 0;
    let totalPropostasAceitas = 0;

    if (role === RoleUsuario.ADMIN) {
      totalProjetosAbertos = await prisma.projeto.count({ where: { status: StatusProjeto.ABERTO } });
      totalPropostasRecebidas = await prisma.proposta.count();
      totalPropostasEmNegociacao = await prisma.proposta.count({
        where: { status: StatusProposta.EM_NEGOCIACAO },
      });
      totalPropostasAceitas = await prisma.proposta.count({ where: { status: StatusProposta.ACEITA } });
    } else {
      totalProjetosAbertos = await prisma.projeto.count({
        where: { criadoPorId: userId, status: StatusProjeto.ABERTO },
      });
      totalPropostasRecebidas = await prisma.proposta.count({
        where: { projeto: { criadoPorId: userId } },
      });
      totalPropostasEmNegociacao = await prisma.proposta.count({
        where: { projeto: { criadoPorId: userId }, status: StatusProposta.EM_NEGOCIACAO },
      });
      totalPropostasAceitas = await prisma.proposta.count({
        where: { projeto: { criadoPorId: userId }, status: StatusProposta.ACEITA },
      });
    }

    return {
      success: true,
      data: {
        clienteNome: role === RoleUsuario.ADMIN ? 'Painel Administrativo' : clientePerfil?.nomeFantasia || 'Cliente',
        clienteDescricao:
          role === RoleUsuario.ADMIN ? 'Resumo geral da plataforma.' : clientePerfil?.descricao || null,
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        totalProjetosAbertos,
        totalPropostasRecebidas,
        totalPropostasEmNegociacao,
        totalPropostasAceitas,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return { success: false, error: 'Não foi possível carregar o dashboard.' };
  }
}

export async function fetchClientePerfil(): Promise<FetchClienteResult> {
  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);
  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  try {
    let cliente = await prisma.cliente.findUnique({
      where: { usuarioId: userId },
    });

    if (!cliente && isAuthorized) {
      cliente = await prisma.cliente.create({
        data: {
          usuarioId: userId,
          nomeFantasia: 'Meu negócio',
        },
      });
    }

    return { success: true, cliente };
  } catch (error) {
    console.error('Erro ao carregar perfil do cliente:', error);
    return { success: false, error: 'Não foi possível carregar o perfil.' };
  }
}

export async function updateClienteAction(data: tClienteForm): Promise<UpdateClienteResult> {
  const { isAuthorized, userId } = await authorizeUser([RoleUsuario.USER, RoleUsuario.ADMIN]);
  if (!isAuthorized || !userId) {
    return { success: false, error: 'Acesso negado.' };
  }

  const validation = clienteFormSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: 'Dados inválidos.' };
  }

  const { id, ...payload } = validation.data;

  try {
    const cliente = await prisma.cliente.upsert({
      where: { usuarioId: userId },
      create: {
        usuarioId: userId,
        nomeFantasia: payload.nomeFantasia,
        descricao: payload.descricao || null,
        cpfOuCnpj: payload.cpfOuCnpj || null,
        websiteUrl: payload.websiteUrl || null,
        localizacao: payload.localizacao || null,
      },
      update: {
        nomeFantasia: payload.nomeFantasia,
        descricao: payload.descricao || null,
        cpfOuCnpj: payload.cpfOuCnpj || null,
        websiteUrl: payload.websiteUrl || null,
        localizacao: payload.localizacao || null,
      },
    });

    revalidatePath('/perfil');

    return { success: true, cliente };
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return { success: false, error: 'Não foi possível salvar o perfil.' };
  }
}
