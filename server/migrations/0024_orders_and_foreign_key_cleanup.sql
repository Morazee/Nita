ALTER TABLE "productVariants" ALTER COLUMN "productID" DROP DEFAULT;
ALTER TABLE "variantImages" ALTER COLUMN "variantID" DROP DEFAULT;
ALTER TABLE "variantTags" ALTER COLUMN "variantID" DROP DEFAULT;
ALTER TABLE "reviews" ALTER COLUMN "productID" DROP DEFAULT;
ALTER TABLE "orderProduct" ALTER COLUMN "productVariantID" DROP DEFAULT;
ALTER TABLE "orderProduct" ALTER COLUMN "productID" DROP DEFAULT;
ALTER TABLE "orderProduct" ALTER COLUMN "orderID" DROP DEFAULT;

ALTER TABLE "orders" ADD CONSTRAINT "orders_paymentIntentID_unique" UNIQUE("paymentIntentID");
