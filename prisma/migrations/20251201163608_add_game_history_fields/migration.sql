/*
  Warnings:

  - You are about to drop the column `result` on the `game_infos` table. All the data in the column will be lost.
  - You are about to drop the `BuildingCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `building` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `player` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_card` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `position` to the `game_infos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BuildingCard" DROP CONSTRAINT "BuildingCard_buildingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BuildingCard" DROP CONSTRAINT "BuildingCard_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BuildingCard" DROP CONSTRAINT "BuildingCard_playerCityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BuildingCard" DROP CONSTRAINT "BuildingCard_playerHandId_fkey";

-- DropForeignKey
ALTER TABLE "public"."player" DROP CONSTRAINT "player_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."player" DROP CONSTRAINT "player_userId_fkey";

-- AlterTable
ALTER TABLE "game_infos" DROP COLUMN "result",
ADD COLUMN     "details" JSONB,
ADD COLUMN     "position" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."BuildingCard";

-- DropTable
DROP TABLE "public"."building";

-- DropTable
DROP TABLE "public"."player";

-- DropTable
DROP TABLE "public"."role_card";

-- CreateTable
CREATE TABLE "_GamePlayers" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_GamePlayers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GamePlayers_B_index" ON "_GamePlayers"("B");

-- AddForeignKey
ALTER TABLE "_GamePlayers" ADD CONSTRAINT "_GamePlayers_A_fkey" FOREIGN KEY ("A") REFERENCES "game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GamePlayers" ADD CONSTRAINT "_GamePlayers_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
