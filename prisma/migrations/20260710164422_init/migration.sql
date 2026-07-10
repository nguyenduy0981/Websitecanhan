-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CREATOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "GiftStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'RECOVERY', 'DELETION_PENDING', 'DELETED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "GiftTier" AS ENUM ('FREE', 'VIP');

-- CreateEnum
CREATE TYPE "GiftBlockType" AS ENUM ('TEXT', 'IMAGE', 'GALLERY');

-- CreateEnum
CREATE TYPE "MediaAssetStatus" AS ENUM ('PENDING', 'READY', 'ORPHANED', 'DELETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'VERIFIED', 'ACTIVATED', 'FAILED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CREATOR',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "suspendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gifts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "status" "GiftStatus" NOT NULL DEFAULT 'DRAFT',
    "tier" "GiftTier" NOT NULL DEFAULT 'FREE',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "themeId" TEXT,
    "effectId" TEXT,
    "musicId" TEXT,
    "publishedAt" TIMESTAMP(3),
    "activeExpiresAt" TIMESTAMP(3),
    "recoveryEndsAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "prevStatus" "GiftStatus",
    "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_blocks" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "type" "GiftBlockType" NOT NULL,
    "position" INTEGER NOT NULL,
    "content" JSONB NOT NULL,

    CONSTRAINT "gift_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "giftId" TEXT,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'PENDING',
    "storageKey" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "mimeType" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_tracks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "music_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "giftId" TEXT,
    "provider" TEXT NOT NULL,
    "providerTransactionId" TEXT,
    "orderCode" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "product" TEXT NOT NULL DEFAULT 'VIP_15D',
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "rawWebhook" JSONB,
    "verifiedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "reporterId" TEXT,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gift_views" (
    "id" TEXT NOT NULL,
    "giftId" TEXT NOT NULL,
    "deviceClass" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gift_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "giftId" TEXT,
    "props" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "meta" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_runs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "ok" BOOLEAN,
    "itemsProcessed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "gifts_slug_key" ON "gifts"("slug");

-- CreateIndex
CREATE INDEX "gifts_status_activeExpiresAt_idx" ON "gifts"("status", "activeExpiresAt");

-- CreateIndex
CREATE INDEX "gifts_status_recoveryEndsAt_idx" ON "gifts"("status", "recoveryEndsAt");

-- CreateIndex
CREATE INDEX "gifts_ownerId_idx" ON "gifts"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "gift_blocks_giftId_position_key" ON "gift_blocks"("giftId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_storageKey_key" ON "media_assets"("storageKey");

-- CreateIndex
CREATE INDEX "media_assets_status_createdAt_idx" ON "media_assets"("status", "createdAt");

-- CreateIndex
CREATE INDEX "media_assets_ownerId_idx" ON "media_assets"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderCode_key" ON "payments"("orderCode");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_providerTransactionId_key" ON "payments"("provider", "providerTransactionId");

-- CreateIndex
CREATE INDEX "reports_giftId_idx" ON "reports"("giftId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "gift_views_giftId_createdAt_idx" ON "gift_views"("giftId", "createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_name_createdAt_idx" ON "analytics_events"("name", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "job_runs_name_startedAt_idx" ON "job_runs"("name", "startedAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gifts" ADD CONSTRAINT "gifts_musicId_fkey" FOREIGN KEY ("musicId") REFERENCES "music_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_blocks" ADD CONSTRAINT "gift_blocks_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_views" ADD CONSTRAINT "gift_views_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "gifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

