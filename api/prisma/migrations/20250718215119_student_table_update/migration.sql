/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "enrollments" ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "progress" ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STUDENT';

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
