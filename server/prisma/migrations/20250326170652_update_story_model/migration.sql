-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "media" TEXT[],
    "user_id" VARCHAR(36) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "viewers" VARCHAR(36)[],
    "mediaPublicIds" VARCHAR(255)[],
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StoryLikes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StoryLikes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "stories_user_id_idx" ON "stories"("user_id");

-- CreateIndex
CREATE INDEX "stories_expiresAt_idx" ON "stories"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "stories_id_key" ON "stories"("id");

-- CreateIndex
CREATE INDEX "_StoryLikes_B_index" ON "_StoryLikes"("B");

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoryLikes" ADD CONSTRAINT "_StoryLikes_A_fkey" FOREIGN KEY ("A") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoryLikes" ADD CONSTRAINT "_StoryLikes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
