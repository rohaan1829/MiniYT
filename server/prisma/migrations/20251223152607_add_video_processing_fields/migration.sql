-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "processingProgress" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'pending';
