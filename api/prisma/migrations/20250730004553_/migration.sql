/*
  Warnings:

  - You are about to drop the `student_profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - The required column `studentCode` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `userId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."student_profiles" DROP CONSTRAINT "student_profiles_userId_fkey";

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "studentCode" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."student_profiles";

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "public"."users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_studentCode_key" ON "public"."users"("studentCode");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
