/*
  Warnings:

  - You are about to alter the column `amount` on the `deposits` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.
  - You are about to alter the column `targetAmount` on the `saving_goals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(15,2)`.

*/
-- AlterTable
ALTER TABLE "deposits" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15,2);

-- AlterTable
ALTER TABLE "saving_goals" ADD COLUMN     "description" TEXT DEFAULT '',
ALTER COLUMN "targetAmount" SET DATA TYPE DECIMAL(15,2);
