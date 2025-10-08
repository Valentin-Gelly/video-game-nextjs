/*
  Warnings:

  - You are about to drop the `GameInfos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Games` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."GameInfos" DROP CONSTRAINT "GameInfos_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameInfos" DROP CONSTRAINT "GameInfos_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Games" DROP CONSTRAINT "Games_createdBy_fkey";

-- DropTable
DROP TABLE "public"."GameInfos";

-- DropTable
DROP TABLE "public"."Games";

-- CreateTable
CREATE TABLE "game_infos" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "result" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_infos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "gameId" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentTurn" INTEGER,

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cost" INTEGER,
    "color" TEXT,
    "ownerId" INTEGER,
    "gameId" TEXT,

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "building" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "playerId" INTEGER,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "game_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_role_playerId_key" ON "game_role"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "game_role_gameId_order_key" ON "game_role"("gameId", "order");

-- AddForeignKey
ALTER TABLE "game_infos" ADD CONSTRAINT "game_infos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_infos" ADD CONSTRAINT "game_infos_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "building" ADD CONSTRAINT "building_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_role" ADD CONSTRAINT "game_role_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_role" ADD CONSTRAINT "game_role_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
