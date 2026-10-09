/*
  Warnings:

  - You are about to drop the column `authorId` on the `Building` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Building" DROP CONSTRAINT "Building_authorId_fkey";

-- AlterTable
ALTER TABLE "Building" DROP COLUMN "authorId";

-- DropTable
DROP TABLE "User";
