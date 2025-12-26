/*
  Warnings:

  - A unique constraint covering the columns `[userId,videoId]` on the table `watch_history` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "watch_history" ADD COLUMN     "watchProgress" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "watch_history_userId_viewedAt_idx" ON "watch_history"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "watch_history_userId_videoId_key" ON "watch_history"("userId", "videoId");
