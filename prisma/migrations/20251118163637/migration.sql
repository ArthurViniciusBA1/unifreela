/*
  Warnings:

  - The values [INICIANTE,NATIVO] on the enum `NivelProficiencia` will be removed. If these variants are still used in the database, this will fail.
  - The values [CANDIDATO,RECRUTADOR] on the enum `RoleUsuario` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `credencialId` on the `certificacoes` table. All the data in the column will be lost.
  - You are about to drop the column `credencialUrl` on the `certificacoes` table. All the data in the column will be lost.
  - You are about to drop the column `local` on the `experiencias_profissionais` table. All the data in the column will be lost.
  - You are about to drop the column `nomeEmpresa` on the `experiencias_profissionais` table. All the data in the column will be lost.
  - You are about to drop the column `trabalhoAtual` on the `experiencias_profissionais` table. All the data in the column will be lost.
  - You are about to drop the column `areaEstudo` on the `formacoes_academicas` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `formacoes_academicas` table. All the data in the column will be lost.
  - You are about to drop the column `emCurso` on the `formacoes_academicas` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `habilidades` table. All the data in the column will be lost.
  - You are about to drop the column `atualizadoEm` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `empresaId` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `numeroRA` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `candidaturas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `curriculos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `empresas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `projetos_pessoais` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vagas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `empresa` to the `experiencias_profissionais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoProjeto" AS ENUM ('PROJETO_FIXO', 'HORA', 'CONSULTORIA', 'LONGO_PRAZO');

-- CreateEnum
CREATE TYPE "StatusProjeto" AS ENUM ('RASCUNHO', 'ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusProposta" AS ENUM ('ENVIADA', 'EM_NEGOCIACAO', 'ACEITA', 'RECUSADA');

-- AlterEnum
BEGIN;
CREATE TYPE "NivelProficiencia_new" AS ENUM ('BASICO', 'INTERMEDIARIO', 'AVANCADO', 'ESPECIALISTA');
ALTER TABLE "idiomas" ALTER COLUMN "nivel" TYPE "NivelProficiencia_new" USING ("nivel"::text::"NivelProficiencia_new");
ALTER TYPE "NivelProficiencia" RENAME TO "NivelProficiencia_old";
ALTER TYPE "NivelProficiencia_new" RENAME TO "NivelProficiencia";
DROP TYPE "public"."NivelProficiencia_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RoleUsuario_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "public"."usuarios" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "usuarios" ALTER COLUMN "role" TYPE "RoleUsuario_new" USING ("role"::text::"RoleUsuario_new");
ALTER TYPE "RoleUsuario" RENAME TO "RoleUsuario_old";
ALTER TYPE "RoleUsuario_new" RENAME TO "RoleUsuario";
DROP TYPE "public"."RoleUsuario_old";
ALTER TABLE "usuarios" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "candidaturas" DROP CONSTRAINT "candidaturas_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "candidaturas" DROP CONSTRAINT "candidaturas_vagaId_fkey";

-- DropForeignKey
ALTER TABLE "certificacoes" DROP CONSTRAINT "certificacoes_curriculoId_fkey";

-- DropForeignKey
ALTER TABLE "curriculos" DROP CONSTRAINT "curriculos_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "empresas" DROP CONSTRAINT "empresas_cadastradaPorId_fkey";

-- DropForeignKey
ALTER TABLE "experiencias_profissionais" DROP CONSTRAINT "experiencias_profissionais_curriculoId_fkey";

-- DropForeignKey
ALTER TABLE "formacoes_academicas" DROP CONSTRAINT "formacoes_academicas_curriculoId_fkey";

-- DropForeignKey
ALTER TABLE "habilidades" DROP CONSTRAINT "habilidades_curriculoId_fkey";

-- DropForeignKey
ALTER TABLE "idiomas" DROP CONSTRAINT "idiomas_curriculoId_fkey";

-- DropForeignKey
ALTER TABLE "projetos_pessoais" DROP CONSTRAINT "projetos_pessoais_curriculoId_fkey";

-- DropForeignKey
ALTER TABLE "usuarios" DROP CONSTRAINT "usuarios_empresaId_fkey";

-- DropForeignKey
ALTER TABLE "vagas" DROP CONSTRAINT "vagas_criadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "vagas" DROP CONSTRAINT "vagas_empresaId_fkey";

-- DropIndex
DROP INDEX "usuarios_numeroRA_key";

-- AlterTable
ALTER TABLE "certificacoes" DROP COLUMN "credencialId",
DROP COLUMN "credencialUrl",
ADD COLUMN     "urlCredencial" TEXT;

-- AlterTable
ALTER TABLE "experiencias_profissionais" DROP COLUMN "local",
DROP COLUMN "nomeEmpresa",
DROP COLUMN "trabalhoAtual",
ADD COLUMN     "atual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "empresa" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "formacoes_academicas" DROP COLUMN "areaEstudo",
DROP COLUMN "descricao",
DROP COLUMN "emCurso",
ADD COLUMN     "concluido" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "habilidades" DROP COLUMN "categoria";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "atualizadoEm",
DROP COLUMN "empresaId",
DROP COLUMN "numeroRA",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'USER';

-- DropTable
DROP TABLE "candidaturas";

-- DropTable
DROP TABLE "curriculos";

-- DropTable
DROP TABLE "empresas";

-- DropTable
DROP TABLE "projetos_pessoais";

-- DropTable
DROP TABLE "vagas";

-- DropEnum
DROP TYPE "StatusCandidatura";

-- DropEnum
DROP TYPE "TipoVaga";

-- CreateTable
CREATE TABLE "perfil_cliente" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cpfOuCnpj" TEXT,
    "descricao" TEXT,
    "websiteUrl" TEXT,
    "localizacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfil_freelancer" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tituloProfissional" TEXT NOT NULL,
    "resumo" TEXT,
    "valorHora" DECIMAL(65,30),
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfil_freelancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projetos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "habilidadesDesejadas" TEXT[],
    "tipo" "TipoProjeto" NOT NULL,
    "status" "StatusProjeto" NOT NULL DEFAULT 'ABERTO',
    "orcamentoEstimado" TEXT,
    "prazoEstimado" TEXT,
    "remoto" BOOLEAN NOT NULL DEFAULT true,
    "criadoPorId" TEXT NOT NULL,
    "dataPublicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propostas" (
    "id" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "valorProposto" DECIMAL(65,30) NOT NULL,
    "prazoEstimadoDias" INTEGER NOT NULL,
    "status" "StatusProposta" NOT NULL DEFAULT 'ENVIADA',
    "freelancerId" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "propostas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "projetoId" TEXT NOT NULL,
    "avaliadorId" TEXT NOT NULL,
    "avaliadoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfil_cliente_usuarioId_key" ON "perfil_cliente"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_freelancer_usuarioId_key" ON "perfil_freelancer"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "propostas_freelancerId_projetoId_key" ON "propostas"("freelancerId", "projetoId");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_projetoId_key" ON "avaliacoes"("projetoId");

-- AddForeignKey
ALTER TABLE "perfil_cliente" ADD CONSTRAINT "perfil_cliente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfil_freelancer" ADD CONSTRAINT "perfil_freelancer_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "propostas" ADD CONSTRAINT "propostas_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiencias_profissionais" ADD CONSTRAINT "experiencias_profissionais_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "perfil_freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formacoes_academicas" ADD CONSTRAINT "formacoes_academicas_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "perfil_freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habilidades" ADD CONSTRAINT "habilidades_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "perfil_freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idiomas" ADD CONSTRAINT "idiomas_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "perfil_freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificacoes" ADD CONSTRAINT "certificacoes_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "perfil_freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
