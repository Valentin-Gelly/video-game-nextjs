/*
  Warnings:

  - A unique constraint covering the columns `[gameCode]` on the table `game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdById` to the `game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameCode` to the `game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "game" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "gameCode" TEXT NOT NULL,
ADD COLUMN     "gameName" TEXT NOT NULL DEFAULT 'New Game',
ADD COLUMN     "gameState" TEXT NOT NULL DEFAULT 'WAITING_PLAYERS';

-- CreateIndex
CREATE UNIQUE INDEX "game_gameCode_key" ON "game"("gameCode");

-- AddForeignKey
ALTER TABLE "game" ADD CONSTRAINT "game_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
