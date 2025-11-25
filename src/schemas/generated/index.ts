import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// DECIMAL
//------------------------------------------------------

export const DecimalJsLikeSchema: z.ZodType<Prisma.DecimalJsLike> = z.object({
  d: z.array(z.number()),
  e: z.number(),
  s: z.number(),
  toFixed: z.any(),
})

export const DECIMAL_STRING_REGEX = /^(?:-?Infinity|NaN|-?(?:0[bB][01]+(?:\.[01]+)?(?:[pP][-+]?\d+)?|0[oO][0-7]+(?:\.[0-7]+)?(?:[pP][-+]?\d+)?|0[xX][\da-fA-F]+(?:\.[\da-fA-F]+)?(?:[pP][-+]?\d+)?|(?:\d+|\d*\.\d+)(?:[eE][-+]?\d+)?))$/;

export const isValidDecimalInput =
  (v?: null | string | number | Prisma.DecimalJsLike): v is string | number | Prisma.DecimalJsLike => {
    if (v === undefined || v === null) return false;
    return (
      (typeof v === 'object' && 'd' in v && 'e' in v && 's' in v && 'toFixed' in v) ||
      (typeof v === 'string' && DECIMAL_STRING_REGEX.test(v)) ||
      typeof v === 'number'
    )
  };

/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UsuarioScalarFieldEnumSchema = z.enum(['id','email','senha','nome','fotoUrl','role','ativo','criadoEm','updatedAt']);

export const ClienteScalarFieldEnumSchema = z.enum(['id','usuarioId','nomeFantasia','cpfOuCnpj','descricao','websiteUrl','localizacao','createdAt','updatedAt']);

export const CurriculoScalarFieldEnumSchema = z.enum(['id','usuarioId','tituloProfissional','resumo','valorHora','portfolioUrl','githubUrl','linkedinUrl','disponivel','createdAt','updatedAt']);

export const ProjetoScalarFieldEnumSchema = z.enum(['id','titulo','descricao','habilidadesDesejadas','tipo','status','orcamentoEstimado','prazoEstimado','remoto','criadoPorId','dataPublicacao','updatedAt']);

export const PropostaScalarFieldEnumSchema = z.enum(['id','mensagem','valorProposto','prazoEstimadoDias','status','freelancerId','projetoId','createdAt','updatedAt']);

export const AvaliacaoScalarFieldEnumSchema = z.enum(['id','nota','comentario','projetoId','avaliadorId','avaliadoId','createdAt']);

export const ExperienciaProfissionalScalarFieldEnumSchema = z.enum(['id','cargo','empresa','descricao','dataInicio','dataFim','atual','curriculoId']);

export const FormacaoAcademicaScalarFieldEnumSchema = z.enum(['id','instituicao','curso','dataInicio','dataFim','concluido','curriculoId']);

export const HabilidadeScalarFieldEnumSchema = z.enum(['id','nome','curriculoId']);

export const IdiomaScalarFieldEnumSchema = z.enum(['id','nome','nivel','curriculoId']);

export const CertificacaoScalarFieldEnumSchema = z.enum(['id','nome','organizacaoEmissora','dataEmissao','urlCredencial','curriculoId']);

export const ProjetoPortfolioScalarFieldEnumSchema = z.enum(['id','nome','descricao','projectUrl','repositorioUrl','dataInicio','dataFim','tecnologiasUsadas','curriculoId','createdAt','updatedAt']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const RoleUsuarioSchema = z.enum(['USER','ADMIN']);

export type RoleUsuarioType = `${z.infer<typeof RoleUsuarioSchema>}`

export const NivelProficienciaSchema = z.enum(['BASICO','INTERMEDIARIO','AVANCADO','ESPECIALISTA']);

export type NivelProficienciaType = `${z.infer<typeof NivelProficienciaSchema>}`

export const TipoProjetoSchema = z.enum(['PROJETO_FIXO','DIÁRIA','HORA','CONSULTORIA','LONGO_PRAZO']);

export type TipoProjetoType = `${z.infer<typeof TipoProjetoSchema>}`

export const StatusProjetoSchema = z.enum(['RASCUNHO','ABERTO','EM_ANDAMENTO','CONCLUIDO','CANCELADO']);

export type StatusProjetoType = `${z.infer<typeof StatusProjetoSchema>}`

export const StatusPropostaSchema = z.enum(['ENVIADA','EM_NEGOCIACAO','ACEITA','RECUSADA']);

export type StatusPropostaType = `${z.infer<typeof StatusPropostaSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USUARIO SCHEMA
/////////////////////////////////////////

export const UsuarioSchema = z.object({
  role: RoleUsuarioSchema,
  id: z.cuid(),
  email: z.string(),
  senha: z.string(),
  nome: z.string(),
  fotoUrl: z.string().nullable(),
  ativo: z.boolean(),
  criadoEm: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Usuario = z.infer<typeof UsuarioSchema>

/////////////////////////////////////////
// CLIENTE SCHEMA
/////////////////////////////////////////

export const ClienteSchema = z.object({
  id: z.cuid(),
  usuarioId: z.string(),
  nomeFantasia: z.string().nullable(),
  cpfOuCnpj: z.string().nullable(),
  descricao: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  localizacao: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Cliente = z.infer<typeof ClienteSchema>

/////////////////////////////////////////
// CURRICULO SCHEMA
/////////////////////////////////////////

export const CurriculoSchema = z.object({
  id: z.cuid(),
  usuarioId: z.string(),
  tituloProfissional: z.string(),
  resumo: z.string().nullable(),
  valorHora: z.instanceof(Prisma.Decimal, { message: "Field 'valorHora' must be a Decimal. Location: ['Models', 'Curriculo']"}).nullable(),
  portfolioUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  disponivel: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Curriculo = z.infer<typeof CurriculoSchema>

/////////////////////////////////////////
// PROJETO SCHEMA
/////////////////////////////////////////

export const ProjetoSchema = z.object({
  tipo: TipoProjetoSchema,
  status: StatusProjetoSchema,
  id: z.cuid(),
  titulo: z.string(),
  descricao: z.string(),
  habilidadesDesejadas: z.string().array(),
  orcamentoEstimado: z.string().nullable(),
  prazoEstimado: z.string().nullable(),
  remoto: z.boolean(),
  criadoPorId: z.string(),
  dataPublicacao: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Projeto = z.infer<typeof ProjetoSchema>

/////////////////////////////////////////
// PROPOSTA SCHEMA
/////////////////////////////////////////

export const PropostaSchema = z.object({
  status: StatusPropostaSchema,
  id: z.cuid(),
  mensagem: z.string(),
  valorProposto: z.instanceof(Prisma.Decimal, { message: "Field 'valorProposto' must be a Decimal. Location: ['Models', 'Proposta']"}),
  prazoEstimadoDias: z.number().int(),
  freelancerId: z.string(),
  projetoId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type Proposta = z.infer<typeof PropostaSchema>

/////////////////////////////////////////
// AVALIACAO SCHEMA
/////////////////////////////////////////

export const AvaliacaoSchema = z.object({
  id: z.cuid(),
  nota: z.number().int(),
  comentario: z.string().nullable(),
  projetoId: z.string(),
  avaliadorId: z.string(),
  avaliadoId: z.string(),
  createdAt: z.coerce.date(),
})

export type Avaliacao = z.infer<typeof AvaliacaoSchema>

/////////////////////////////////////////
// EXPERIENCIA PROFISSIONAL SCHEMA
/////////////////////////////////////////

export const ExperienciaProfissionalSchema = z.object({
  id: z.cuid(),
  cargo: z.string(),
  empresa: z.string(),
  descricao: z.string().nullable(),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().nullable(),
  atual: z.boolean(),
  curriculoId: z.string(),
})

export type ExperienciaProfissional = z.infer<typeof ExperienciaProfissionalSchema>

/////////////////////////////////////////
// FORMACAO ACADEMICA SCHEMA
/////////////////////////////////////////

export const FormacaoAcademicaSchema = z.object({
  id: z.cuid(),
  instituicao: z.string(),
  curso: z.string(),
  dataInicio: z.coerce.date(),
  dataFim: z.coerce.date().nullable(),
  concluido: z.boolean(),
  curriculoId: z.string(),
})

export type FormacaoAcademica = z.infer<typeof FormacaoAcademicaSchema>

/////////////////////////////////////////
// HABILIDADE SCHEMA
/////////////////////////////////////////

export const HabilidadeSchema = z.object({
  id: z.cuid(),
  nome: z.string(),
  curriculoId: z.string(),
})

export type Habilidade = z.infer<typeof HabilidadeSchema>

/////////////////////////////////////////
// IDIOMA SCHEMA
/////////////////////////////////////////

export const IdiomaSchema = z.object({
  nivel: NivelProficienciaSchema,
  id: z.cuid(),
  nome: z.string(),
  curriculoId: z.string(),
})

export type Idioma = z.infer<typeof IdiomaSchema>

/////////////////////////////////////////
// CERTIFICACAO SCHEMA
/////////////////////////////////////////

export const CertificacaoSchema = z.object({
  id: z.cuid(),
  nome: z.string(),
  organizacaoEmissora: z.string(),
  dataEmissao: z.coerce.date(),
  urlCredencial: z.string().nullable(),
  curriculoId: z.string(),
})

export type Certificacao = z.infer<typeof CertificacaoSchema>

/////////////////////////////////////////
// PROJETO PORTFOLIO SCHEMA
/////////////////////////////////////////

export const ProjetoPortfolioSchema = z.object({
  id: z.cuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  projectUrl: z.string().nullable(),
  repositorioUrl: z.string().nullable(),
  dataInicio: z.coerce.date().nullable(),
  dataFim: z.coerce.date().nullable(),
  tecnologiasUsadas: z.string().array(),
  curriculoId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type ProjetoPortfolio = z.infer<typeof ProjetoPortfolioSchema>
