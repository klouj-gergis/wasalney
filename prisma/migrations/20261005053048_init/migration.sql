/*
  Warnings:

  - Added the required column `alt` to the `Building` table without a default value. This is not possible if the table is not empty.
  - Added the required column `long` to the `Building` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "alt" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "long" DECIMAL(65,30) NOT NULL;
