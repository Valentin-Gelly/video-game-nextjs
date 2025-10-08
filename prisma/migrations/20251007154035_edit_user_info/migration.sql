/*
  Warnings:

  - You are about to drop the column `lastname` on the `user` table. All the data in the column will be lost.
  - Added the required column `name` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "lastname",
ADD COLUMN     "name" TEXT NOT NULL;
