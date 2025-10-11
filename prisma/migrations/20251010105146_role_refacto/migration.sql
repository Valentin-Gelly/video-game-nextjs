/*
  Warnings:

  - You are about to drop the `game_role` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."game_role" DROP CONSTRAINT "game_role_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_role" DROP CONSTRAINT "game_role_playerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_role" DROP CONSTRAINT "game_role_roleCardId_fkey";

-- AlterTable
ALTER TABLE "role_card" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'Blanc',
ADD COLUMN     "gameId" TEXT;

-- DropTable
DROP TABLE "public"."game_role";

-- AddForeignKey
ALTER TABLE "role_card" ADD CONSTRAINT "role_card_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
