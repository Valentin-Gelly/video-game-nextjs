/*
  Warnings:

  - Added the required column `gameName` to the `Games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Games" ADD COLUMN     "gameName" TEXT NOT NULL;
