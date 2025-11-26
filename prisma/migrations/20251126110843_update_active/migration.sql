-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."product_variants" ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."shops" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
