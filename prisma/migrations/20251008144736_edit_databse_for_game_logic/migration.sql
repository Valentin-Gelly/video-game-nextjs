/*
  Warnings:

  - You are about to drop the column `gameId` on the `building` table. All the data in the column will be lost.
  - You are about to drop the column `playerCityId` on the `building` table. All the data in the column will be lost.
  - You are about to drop the column `playerHandId` on the `building` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."building" DROP CONSTRAINT "building_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."building" DROP CONSTRAINT "building_playerCityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."building" DROP CONSTRAINT "building_playerHandId_fkey";

-- AlterTable
ALTER TABLE "building" DROP COLUMN "gameId",
DROP COLUMN "playerCityId",
DROP COLUMN "playerHandId";

-- CreateTable
CREATE TABLE "BuildingCard" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'deck',
    "playerCityId" INTEGER,
    "playerHandId" INTEGER,
    "gameId" TEXT,
    "buildingId" INTEGER,

    CONSTRAINT "BuildingCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BuildingCard" ADD CONSTRAINT "BuildingCard_playerCityId_fkey" FOREIGN KEY ("playerCityId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingCard" ADD CONSTRAINT "BuildingCard_playerHandId_fkey" FOREIGN KEY ("playerHandId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingCard" ADD CONSTRAINT "BuildingCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingCard" ADD CONSTRAINT "BuildingCard_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
