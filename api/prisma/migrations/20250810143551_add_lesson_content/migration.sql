/*
  Warnings:

  - You are about to drop the column `content` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `lessons` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `lessons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."lessons" DROP COLUMN "content",
DROP COLUMN "duration",
DROP COLUMN "type",
DROP COLUMN "videoUrl";

-- CreateTable
CREATE TABLE "public"."lesson_contents" (
    "id" TEXT NOT NULL,
    "type" "public"."LessonType" NOT NULL,
    "videoUrl" TEXT,
    "duration" INTEGER,
    "content" TEXT,
    "quizData" JSONB,
    "lessonId" TEXT NOT NULL,

    CONSTRAINT "lesson_contents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."lesson_contents" ADD CONSTRAINT "lesson_contents_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
