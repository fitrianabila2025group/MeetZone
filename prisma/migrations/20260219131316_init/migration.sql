-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "AdProvider" AS ENUM ('adsense', 'adsterra', 'monetag', 'hilltopads', 'custom');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timezone" (
    "id" TEXT NOT NULL,
    "ianaName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL DEFAULT '',
    "utcOffsetMinutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Timezone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lng" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "population" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timezoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PopularPair" (
    "id" TEXT NOT NULL,
    "fromCityId" TEXT NOT NULL,
    "toCityId" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PopularPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoTemplate" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "titleTpl" TEXT NOT NULL,
    "metaTpl" TEXT NOT NULL,
    "introTpl" TEXT NOT NULL,
    "faqTplJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "pairSlug" TEXT,
    "fromCityId" TEXT,
    "toCityId" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalLinkBlock" (
    "id" TEXT NOT NULL,
    "blockKey" TEXT NOT NULL,
    "linksJson" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalLinkBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingShare" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cityIds" TEXT NOT NULL,
    "baseCityId" TEXT NOT NULL,
    "dateTimeISO" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "MeetingShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdsSetting" (
    "id" TEXT NOT NULL,
    "provider" "AdProvider" NOT NULL DEFAULT 'custom',
    "adsenseClientId" TEXT NOT NULL DEFAULT '',
    "adsTxtLines" TEXT NOT NULL DEFAULT '',
    "headHtml" TEXT NOT NULL DEFAULT '',
    "bodyHtml" TEXT NOT NULL DEFAULT '',
    "slotsJson" TEXT NOT NULL DEFAULT '{}',
    "verificationMeta" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdsSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "contentHtml" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "tags" TEXT[],
    "readingTimeMinutes" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Timezone_ianaName_key" ON "Timezone"("ianaName");

-- CreateIndex
CREATE UNIQUE INDEX "City_slug_key" ON "City"("slug");

-- CreateIndex
CREATE INDEX "City_countryCode_idx" ON "City"("countryCode");

-- CreateIndex
CREATE INDEX "City_timezoneId_idx" ON "City"("timezoneId");

-- CreateIndex
CREATE UNIQUE INDEX "PopularPair_slug_key" ON "PopularPair"("slug");

-- CreateIndex
CREATE INDEX "PopularPair_priority_idx" ON "PopularPair"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "PopularPair_fromCityId_toCityId_key" ON "PopularPair"("fromCityId", "toCityId");

-- CreateIndex
CREATE INDEX "FAQ_scope_idx" ON "FAQ"("scope");

-- CreateIndex
CREATE INDEX "FAQ_fromCityId_toCityId_idx" ON "FAQ"("fromCityId", "toCityId");

-- CreateIndex
CREATE UNIQUE INDEX "InternalLinkBlock_blockKey_key" ON "InternalLinkBlock"("blockKey");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingShare_slug_key" ON "MeetingShare"("slug");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_timezoneId_fkey" FOREIGN KEY ("timezoneId") REFERENCES "Timezone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularPair" ADD CONSTRAINT "PopularPair_fromCityId_fkey" FOREIGN KEY ("fromCityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PopularPair" ADD CONSTRAINT "PopularPair_toCityId_fkey" FOREIGN KEY ("toCityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_fromCityId_fkey" FOREIGN KEY ("fromCityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_toCityId_fkey" FOREIGN KEY ("toCityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
