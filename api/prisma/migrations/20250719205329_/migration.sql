/*
  Warnings:

  - You are about to drop the column `studentId` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `progress` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `purchases` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `students` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "courses" DROP CONSTRAINT "courses_studentId_fkey";

-- DropForeignKey
ALTER TABLE "enrollments" DROP CONSTRAINT "enrollments_studentId_fkey";

-- DropForeignKey
ALTER TABLE "progress" DROP CONSTRAINT "progress_studentId_fkey";

-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_studentId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_studentId_fkey";

-- DropIndex
DROP INDEX "students_email_key";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "progress" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "purchases" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "studentId";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "avatar",
DROP COLUMN "bio",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
