/*
  Warnings:

  - The primary key for the `Games` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."GameInfos" DROP CONSTRAINT "GameInfos_gameId_fkey";

-- AlterTable
ALTER TABLE "GameInfos" ALTER COLUMN "gameId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Games" DROP CONSTRAINT "Games_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Games_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Games_id_seq";

-- AddForeignKey
ALTER TABLE "GameInfos" ADD CONSTRAINT "GameInfos_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
