/*
  Warnings:

  - Added the required column `result` to the `GameInfos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GameInfos" ADD COLUMN     "result" INTEGER NOT NULL;
