import { z } from 'zod';

import { StatusProjetoSchema, TipoProjetoSchema } from './generated';

export const projetoFormSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(3, 'O título do projeto deve ter pelo menos 3 caracteres.'),
  descricao: z.string().min(20, 'A descrição do projeto deve ter pelo menos 20 caracteres.'),
  habilidadesDesejadas: z.string().min(1, 'Informe ao menos uma habilidade desejada.'),
  tipo: TipoProjetoSchema,
  status: StatusProjetoSchema.optional(),
  orcamentoEstimado: z.string().optional().or(z.literal('')),
  prazoEstimado: z.string().optional().or(z.literal('')),
  remoto: z.boolean().default(true),
});

export type tProjetoForm = z.infer<typeof projetoFormSchema>;

