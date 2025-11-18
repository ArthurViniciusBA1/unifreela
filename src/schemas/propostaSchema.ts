import { z } from 'zod';

import { StatusPropostaSchema } from './generated';

export const propostaFormSchema = z.object({
  projetoId: z.string().min(1, 'Projeto obrigatório.'),
  mensagem: z.string().min(10, 'Descreva sua proposta com pelo menos 10 caracteres.'),
  valor: z
    .string()
    .min(1, 'Informe o valor proposto.')
    .regex(/^\d+(?:[.,]\d{1,2})?$/, 'Formato inválido. Use apenas números e até duas casas decimais.'),
  prazoEstimadoDias: z.coerce.number().int().positive('Informe o prazo em dias.'),
  status: StatusPropostaSchema.optional(),
});

export type tPropostaForm = z.infer<typeof propostaFormSchema>;

