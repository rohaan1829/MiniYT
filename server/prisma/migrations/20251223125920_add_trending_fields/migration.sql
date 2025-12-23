-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "category" TEXT,
ADD COLUMN     "lastTrendingUpdate" TIMESTAMP(3),
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "trendingScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "view_snapshots" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "view_snapshots_videoId_timestamp_idx" ON "view_snapshots"("videoId", "timestamp");

-- CreateIndex
CREATE INDEX "videos_trendingScore_category_idx" ON "videos"("trendingScore", "category");

-- CreateIndex
CREATE INDEX "videos_publishedAt_idx" ON "videos"("publishedAt");

-- AddForeignKey
ALTER TABLE "view_snapshots" ADD CONSTRAINT "view_snapshots_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
