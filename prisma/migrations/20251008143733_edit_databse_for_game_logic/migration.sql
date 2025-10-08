/*
  Warnings:

  - You are about to drop the column `description` on the `game_role` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `game_role` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `game_role` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId]` on the table `game_role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleCardId` to the `game_role` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."game_role_gameId_order_key";

-- AlterTable
ALTER TABLE "game_role" DROP COLUMN "description",
DROP COLUMN "name",
DROP COLUMN "order",
ADD COLUMN     "roleCardId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "role_card" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "role_card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "game_role_gameId_key" ON "game_role"("gameId");

-- AddForeignKey
ALTER TABLE "game_role" ADD CONSTRAINT "game_role_roleCardId_fkey" FOREIGN KEY ("roleCardId") REFERENCES "role_card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
