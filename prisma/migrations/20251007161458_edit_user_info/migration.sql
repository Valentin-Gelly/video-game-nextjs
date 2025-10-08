/*
  Warnings:

  - The primary key for the `GameInfos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `GameInfos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Games` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Games` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[verifiedToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `GameInfos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `gameId` on the `GameInfos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."GameInfos" DROP CONSTRAINT "GameInfos_gameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GameInfos" DROP CONSTRAINT "GameInfos_userId_fkey";

-- AlterTable
ALTER TABLE "GameInfos" DROP CONSTRAINT "GameInfos_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "gameId",
ADD COLUMN     "gameId" INTEGER NOT NULL,
ADD CONSTRAINT "GameInfos_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Games" DROP CONSTRAINT "Games_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Games_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user" DROP CONSTRAINT "user_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "emailVerified" SET DEFAULT false,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_verifiedToken_key" ON "user"("verifiedToken");

-- AddForeignKey
ALTER TABLE "GameInfos" ADD CONSTRAINT "GameInfos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameInfos" ADD CONSTRAINT "GameInfos_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
