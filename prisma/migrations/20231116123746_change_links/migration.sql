/*
  Warnings:

  - You are about to drop the column `user_id` on the `todos` table. All the data in the column will be lost.
  - Added the required column `board_id` to the `todos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_user_id_fkey";

-- AlterTable
ALTER TABLE "todos" DROP COLUMN "user_id",
ADD COLUMN     "board_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("board_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
