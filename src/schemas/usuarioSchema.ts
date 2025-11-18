import { z } from 'zod';

export const cadastroSchema = z
  .object({
    nome: z.string().min(1, 'Nome obrigatório'),
    email: z.string().email('Insira um email válido'),
    senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem',
  });

export type tCadastro = z.infer<typeof cadastroSchema>;

export type tUsuario = Omit<tCadastro, 'confirmarSenha' | 'senha'> & {
  id: string;
  role: string;
};

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
});

export type tLogin = z.infer<typeof loginSchema>;
