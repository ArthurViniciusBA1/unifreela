import { z } from 'zod';

export const clienteFormSchema = z.object({
  id: z.string(),
  nomeFantasia: z.string().min(3, 'Informe o nome fantasia ou identificação do cliente.'),
  descricao: z
    .string()
    .max(2000, 'A descrição não pode exceder 2000 caracteres.')
    .optional()
    .or(z.literal('')),
  cpfOuCnpj: z
    .string()
    .regex(/^\d{11}$|^\d{14}$/, 'Informe apenas números do CPF ou CNPJ.')
    .optional()
    .or(z.literal('')),
  websiteUrl: z.string().url('URL do website inválida.').optional().or(z.literal('')),
  localizacao: z.string().optional().or(z.literal('')),
});

export type tClienteForm = z.infer<typeof clienteFormSchema>;
