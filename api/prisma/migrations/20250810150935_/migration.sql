/*
  Warnings:

  - You are about to drop the `lesson_contents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."lesson_contents" DROP CONSTRAINT "lesson_contents_lessonId_fkey";

-- AlterTable
ALTER TABLE "public"."lessons" ADD COLUMN     "content" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "type" "public"."LessonType" NOT NULL DEFAULT 'VIDEO',
ADD COLUMN     "videoUrl" TEXT;

-- DropTable
DROP TABLE "public"."lesson_contents";
