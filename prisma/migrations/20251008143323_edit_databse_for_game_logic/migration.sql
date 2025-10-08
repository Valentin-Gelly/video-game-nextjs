/*
  Warnings:

  - You are about to drop the column `ownerId` on the `building` table. All the data in the column will be lost.
  - You are about to drop the `card` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."building" DROP CONSTRAINT "building_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."card" DROP CONSTRAINT "card_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."card" DROP CONSTRAINT "card_ownerId_fkey";

-- AlterTable
ALTER TABLE "building" DROP COLUMN "ownerId",
ADD COLUMN     "gameId" TEXT,
ADD COLUMN     "playerCityId" INTEGER,
ADD COLUMN     "playerHandId" INTEGER;

-- DropTable
DROP TABLE "public"."card";

-- AddForeignKey
ALTER TABLE "building" ADD CONSTRAINT "building_playerCityId_fkey" FOREIGN KEY ("playerCityId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building" ADD CONSTRAINT "building_playerHandId_fkey" FOREIGN KEY ("playerHandId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building" ADD CONSTRAINT "building_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE SET NULL ON UPDATE CASCADE;
