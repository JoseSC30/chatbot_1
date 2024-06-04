/*
  Warnings:

  - You are about to drop the column `diagnosticoId` on the `consulta` table. All the data in the column will be lost.
  - You are about to drop the column `productoSugeridoId` on the `consulta` table. All the data in the column will be lost.
  - You are about to drop the column `propmt` on the `prompt` table. All the data in the column will be lost.
  - Added the required column `prompt` to the `prompt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "consulta" DROP CONSTRAINT "consulta_diagnosticoId_fkey";

-- DropForeignKey
ALTER TABLE "consulta" DROP CONSTRAINT "consulta_productoSugeridoId_fkey";

-- AlterTable
ALTER TABLE "consulta" DROP COLUMN "diagnosticoId",
DROP COLUMN "productoSugeridoId";

-- AlterTable
ALTER TABLE "prompt" DROP COLUMN "propmt",
ADD COLUMN     "prompt" TEXT NOT NULL;
