-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'someString',
    "language" TEXT NOT NULL DEFAULT 'us',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardsSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desctiption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "modifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "FlashcardsSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionImage" TEXT,
    "answerImage" TEXT NOT NULL,
    "answerText" TEXT,
    "flashcardsSetId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TagsOnFlashcardsSets" (
    "tagId" TEXT NOT NULL,
    "flashcardsSetId" TEXT NOT NULL,

    CONSTRAINT "TagsOnFlashcardsSets_pkey" PRIMARY KEY ("tagId","flashcardsSetId")
);

-- CreateTable
CREATE TABLE "FavouriteFlashcardsSets" (
    "userId" TEXT NOT NULL,
    "flashcardsSetId" TEXT NOT NULL,

    CONSTRAINT "FavouriteFlashcardsSets_pkey" PRIMARY KEY ("userId","flashcardsSetId")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "flashcardsSetId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "FlashcardsSet" ADD CONSTRAINT "FlashcardsSet_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_flashcardsSetId_fkey" FOREIGN KEY ("flashcardsSetId") REFERENCES "FlashcardsSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnFlashcardsSets" ADD CONSTRAINT "TagsOnFlashcardsSets_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnFlashcardsSets" ADD CONSTRAINT "TagsOnFlashcardsSets_flashcardsSetId_fkey" FOREIGN KEY ("flashcardsSetId") REFERENCES "FlashcardsSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteFlashcardsSets" ADD CONSTRAINT "FavouriteFlashcardsSets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavouriteFlashcardsSets" ADD CONSTRAINT "FavouriteFlashcardsSets_flashcardsSetId_fkey" FOREIGN KEY ("flashcardsSetId") REFERENCES "FlashcardsSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_flashcardsSetId_fkey" FOREIGN KEY ("flashcardsSetId") REFERENCES "FlashcardsSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
