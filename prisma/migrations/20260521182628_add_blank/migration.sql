/*
  Warnings:

  - A unique constraint covering the columns `[userId,paragraphId,word]` on the table `Blank` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Blank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Blank` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Blank_userId_paragraphId_word_key` ON `Blank`(`userId`, `paragraphId`, `word`);

-- AddForeignKey
ALTER TABLE `Blank` ADD CONSTRAINT `Blank_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
