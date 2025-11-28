/*
  Warnings:

  - A unique constraint covering the columns `[serviceType,vehicleCategory]` on the table `Pricing` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Pricing_serviceType_vehicleCategory_key" ON "Pricing"("serviceType", "vehicleCategory");
