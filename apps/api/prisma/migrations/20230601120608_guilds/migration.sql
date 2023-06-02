-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersInGuilds" (
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "UsersInGuilds_pkey" PRIMARY KEY ("userId","guildId")
);

-- AddForeignKey
ALTER TABLE "UsersInGuilds" ADD CONSTRAINT "UsersInGuilds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersInGuilds" ADD CONSTRAINT "UsersInGuilds_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
