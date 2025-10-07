/*
  Warnings:

  - You are about to drop the `OrderInvoice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderInvoice" DROP CONSTRAINT "OrderInvoice_order_id_fkey";

-- DropTable
DROP TABLE "public"."OrderInvoice";

-- CreateTable
CREATE TABLE "public"."order_invoices" (
    "id" TEXT NOT NULL,
    "document_type" "public"."DocumentType" NOT NULL,
    "nitNumber" VARCHAR(15),
    "social_reason" VARCHAR(100),
    "invoice_number" TEXT,
    "invoice_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "order_id" TEXT NOT NULL,

    CONSTRAINT "order_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_invoices_invoice_number_key" ON "public"."order_invoices"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "order_invoices_order_id_key" ON "public"."order_invoices"("order_id");

-- AddForeignKey
ALTER TABLE "public"."order_invoices" ADD CONSTRAINT "order_invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
