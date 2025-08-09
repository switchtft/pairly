/*
  Warnings:

  - You are about to drop the `QuestCompletion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "QuestCompletion_questId_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "QuestCompletion";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserQuest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoyaltyTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoyaltyTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teammateId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "PayoutRequest_teammateId_fkey" FOREIGN KEY ("teammateId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_QueueEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "game" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "numberOfMatches" INTEGER NOT NULL,
    "teammatesNeeded" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "pricePerMatch" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "specialRequests" TEXT,
    "assignedTeammateId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QueueEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "QueueEntry_assignedTeammateId_fkey" FOREIGN KEY ("assignedTeammateId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_QueueEntry" ("createdAt", "duration", "game", "gameMode", "id", "numberOfMatches", "paymentStatus", "pricePerMatch", "specialRequests", "status", "teammatesNeeded", "totalPrice", "updatedAt", "userId") SELECT "createdAt", "duration", "game", "gameMode", "id", "numberOfMatches", "paymentStatus", "pricePerMatch", "specialRequests", "status", "teammatesNeeded", "totalPrice", "updatedAt", "userId" FROM "QueueEntry";
DROP TABLE "QueueEntry";
ALTER TABLE "new_QueueEntry" RENAME TO "QueueEntry";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,
    "rank" TEXT,
    "role" TEXT,
    "game" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'customer',
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "discord" TEXT,
    "steam" TEXT,
    "timezone" TEXT,
    "languages" TEXT NOT NULL DEFAULT 'English',
    "hourlyRate" REAL,
    "availability" TEXT,
    "accountBalance" REAL NOT NULL DEFAULT 0.00,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "loyaltyTier" TEXT NOT NULL DEFAULT 'Bronze',
    "gameNicknames" JSONB,
    "phone" TEXT,
    "country" TEXT,
    "preferences" JSONB,
    "autoAccept" BOOLEAN DEFAULT false,
    "notificationPreferences" JSONB,
    "leaderboardPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("accountBalance", "availability", "avatar", "bio", "createdAt", "discord", "email", "firstName", "game", "gameNicknames", "hourlyRate", "id", "isAdmin", "isOnline", "isPro", "languages", "lastName", "lastSeen", "loyaltyPoints", "loyaltyTier", "password", "rank", "role", "steam", "timezone", "updatedAt", "userType", "username", "verified") SELECT "accountBalance", "availability", "avatar", "bio", "createdAt", "discord", "email", "firstName", "game", "gameNicknames", "hourlyRate", "id", "isAdmin", "isOnline", "isPro", "languages", "lastName", "lastSeen", "loyaltyPoints", "loyaltyTier", "password", "rank", "role", "steam", "timezone", "updatedAt", "userType", "username", "verified" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "UserQuest_questId_userId_key" ON "UserQuest"("questId", "userId");
