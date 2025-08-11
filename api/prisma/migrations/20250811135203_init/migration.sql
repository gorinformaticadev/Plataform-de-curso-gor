/*
  Warnings:

  - You are about to drop the column `content` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."lessons" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "public"."lesson_contents" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lesson_contents_lessonId_key" ON "public"."lesson_contents"("lessonId");

-- AddForeignKey
ALTER TABLE "public"."lesson_contents" ADD CONSTRAINT "lesson_contents_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
