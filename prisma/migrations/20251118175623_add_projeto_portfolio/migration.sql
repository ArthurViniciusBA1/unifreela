-- CreateTable
CREATE TABLE "projetos_portfolio" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "projectUrl" TEXT,
    "repositorioUrl" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "tecnologiasUsadas" TEXT[],
    "curriculoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projetos_portfolio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projetos_portfolio" ADD CONSTRAINT "projetos_portfolio_curriculoId_fkey" FOREIGN KEY ("curriculoId") REFERENCES "perfil_freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
