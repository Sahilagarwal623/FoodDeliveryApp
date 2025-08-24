-- AlterTable
ALTER TABLE "public"."Vendor" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "priceRange" DOUBLE PRECISION,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
