/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurantId` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Vendor" ADD COLUMN     "restaurantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_restaurantId_key" ON "public"."Vendor"("restaurantId");
