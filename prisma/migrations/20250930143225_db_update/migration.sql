/*
  Warnings:

  - The primary key for the `cities` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `departments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `provinces` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cityId` on the `shops` table. All the data in the column will be lost.
  - Added the required column `city_id` to the `shops` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."cities" DROP CONSTRAINT "cities_province_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."order_addresses" DROP CONSTRAINT "order_addresses_city_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."provinces" DROP CONSTRAINT "provinces_department_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."shops" DROP CONSTRAINT "shops_cityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_addresses" DROP CONSTRAINT "user_addresses_city_id_fkey";

-- AlterTable
ALTER TABLE "public"."cities" DROP CONSTRAINT "cities_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "province_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "cities_id_seq";

-- AlterTable
ALTER TABLE "public"."departments" DROP CONSTRAINT "departments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "departments_id_seq";

-- AlterTable
ALTER TABLE "public"."order_addresses" ALTER COLUMN "city_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."provinces" DROP CONSTRAINT "provinces_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "department_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "provinces_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "provinces_id_seq";

-- AlterTable
ALTER TABLE "public"."shops" DROP COLUMN "cityId",
ADD COLUMN     "city_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_addresses" ALTER COLUMN "city_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."user_addresses" ADD CONSTRAINT "user_addresses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."provinces" ADD CONSTRAINT "provinces_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "public"."provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_addresses" ADD CONSTRAINT "order_addresses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
