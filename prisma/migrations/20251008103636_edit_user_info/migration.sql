/*
  Warnings:

  - Added the required column `createdBy` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameCode` to the `Games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "gameCode" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Games" ADD CONSTRAINT "Games_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
