/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `contacto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contacto" DROP COLUMN "updatedAt";

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3) NOT NULL,
    "nacionalidad" TEXT,
    "email" TEXT NOT NULL,
    "infoAdicional" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telefono" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telefono_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt" (
    "id" SERIAL NOT NULL,
    "propmt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto" (
    "id" SERIAL NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "proveedor" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "imagenUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promocionId" INTEGER,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_de_venta" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_de_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promocion" (
    "id" SERIAL NOT NULL,
    "nombreDePromocion" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "descuento" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producto_sugerido" (
    "id" SERIAL NOT NULL,
    "inventarioId" INTEGER NOT NULL,
    "prioridad" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_sugerido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sintoma" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sintoma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostico_sintoma" (
    "id" SERIAL NOT NULL,
    "diagnosticoId" INTEGER NOT NULL,
    "sintomaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostico_sintoma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consulta" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "promptId" INTEGER NOT NULL,
    "diagnosticoId" INTEGER NOT NULL,
    "productoSugeridoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consulta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensaje" (
    "id" SERIAL NOT NULL,
    "consultaId" INTEGER NOT NULL,
    "chatbot" BOOLEAN NOT NULL,
    "contenido" TEXT NOT NULL,
    "hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensaje_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "telefono" ADD CONSTRAINT "telefono_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_promocionId_fkey" FOREIGN KEY ("promocionId") REFERENCES "promocion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_de_venta" ADD CONSTRAINT "historial_de_venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_de_venta" ADD CONSTRAINT "historial_de_venta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto_sugerido" ADD CONSTRAINT "producto_sugerido_inventarioId_fkey" FOREIGN KEY ("inventarioId") REFERENCES "inventario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostico_sintoma" ADD CONSTRAINT "diagnostico_sintoma_diagnosticoId_fkey" FOREIGN KEY ("diagnosticoId") REFERENCES "diagnostico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostico_sintoma" ADD CONSTRAINT "diagnostico_sintoma_sintomaId_fkey" FOREIGN KEY ("sintomaId") REFERENCES "sintoma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta" ADD CONSTRAINT "consulta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta" ADD CONSTRAINT "consulta_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta" ADD CONSTRAINT "consulta_diagnosticoId_fkey" FOREIGN KEY ("diagnosticoId") REFERENCES "diagnostico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta" ADD CONSTRAINT "consulta_productoSugeridoId_fkey" FOREIGN KEY ("productoSugeridoId") REFERENCES "producto_sugerido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensaje" ADD CONSTRAINT "mensaje_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
