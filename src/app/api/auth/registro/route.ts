import { RoleUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { gerarToken } from '@/helpers/jwt';
import { prisma } from '@/lib/prisma';
import { cadastroSchema } from '@/schemas/usuarioSchema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = cadastroSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      );
    }

    const { nome, email, senha } = result.data;

    const existing = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: { form: 'E-mail já cadastrado' } },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hashedPassword,
        role: RoleUsuario.USER,
      },
    });

    const tokenPayload = {
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role,
      email: usuario.email,
    };

    const token = gerarToken(tokenPayload);

    const cookie = await cookies();
    if (cookie.has('token')) {
      cookie.delete('token');
    }
    cookie.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json(
      {
        message: 'Usuário cadastrado com sucesso',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          role: usuario.role,
          email: usuario.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
