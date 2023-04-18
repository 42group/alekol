-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "ftLogin" VARCHAR(255),
    "discordId" VARCHAR(255),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_ftLogin_key" ON "User"("ftLogin");

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

