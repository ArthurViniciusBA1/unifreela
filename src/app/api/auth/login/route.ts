import { RoleUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { gerarToken } from '@/helpers/jwt';
import { prisma } from '@/lib/prisma';
import { loginSchema, tLogin } from '@/schemas/usuarioSchema';

interface TokenPayload {
  id: string;
  nome: string;
  role: RoleUsuario;
  email: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: { form: 'Dados de login inválidos.', details: result.error.format() } }, { status: 400 });
    }

    const { email, senha } = result.data as tLogin;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: {
        perfilCliente: { select: { id: true } },
        perfilFreelancer: { select: { id: true } },
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: { form: 'E-mail ou senha inválidos.' } }, { status: 401 });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return NextResponse.json({ error: { form: 'E-mail ou senha inválidos.' } }, { status: 401 });
    }

    const tokenPayload: TokenPayload = {
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role,
      email: usuario.email,
    };

    const token = gerarToken(tokenPayload);

    const cookieStore = await cookies();
    if (cookieStore.has('token')) {
      cookieStore.delete('token');
    }
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({
      message: 'Login realizado com sucesso!',
      usuario: {
        ...tokenPayload,
        hasPerfilCliente: !!usuario.perfilCliente,
        hasPerfilFreelancer: !!usuario.perfilFreelancer,
      },
    });
  } catch (error) {
    console.error('Erro no endpoint de login:', error);
    return NextResponse.json({ error: 'Erro interno no servidor ao processar o login.' }, { status: 500 });
  }
}
