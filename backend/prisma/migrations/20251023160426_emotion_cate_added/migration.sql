-- CreateTable
CREATE TABLE "emotion_categories" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emotion_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emotions" (
    "id" SERIAL NOT NULL,
    "icon" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "emotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "emotion_categories_title_key" ON "emotion_categories"("title");

-- CreateIndex
CREATE INDEX "emotions_categoryId_idx" ON "emotions"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "emotions_categoryId_label_key" ON "emotions"("categoryId", "label");

-- AddForeignKey
ALTER TABLE "emotions" ADD CONSTRAINT "emotions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "emotion_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
