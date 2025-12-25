-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "video_likes" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "video_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "video_likes_videoId_idx" ON "video_likes"("videoId");

-- CreateIndex
CREATE INDEX "video_likes_userId_idx" ON "video_likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "video_likes_videoId_userId_key" ON "video_likes"("videoId", "userId");

-- AddForeignKey
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_likes" ADD CONSTRAINT "video_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
