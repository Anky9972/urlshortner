-- ============================================================
-- Nice-to-have LinkTree features
-- ============================================================

-- User: verified badge
ALTER TABLE "User" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- LinkTree: password protection
ALTER TABLE "LinkTree" ADD COLUMN "password" TEXT;

-- LinkTree: scheduled activation
ALTER TABLE "LinkTree" ADD COLUMN "publishAt"   TIMESTAMP(3);
ALTER TABLE "LinkTree" ADD COLUMN "unpublishAt" TIMESTAMP(3);

-- LinkTree: custom domain
ALTER TABLE "LinkTree" ADD COLUMN "customDomainId" TEXT;

-- LinkTree: team ownership
ALTER TABLE "LinkTree" ADD COLUMN "teamId" TEXT;

-- LinkTreeItem: A/B testing
ALTER TABLE "LinkTreeItem" ADD COLUMN "abVariantUrl"   TEXT;
ALTER TABLE "LinkTreeItem" ADD COLUMN "abVariantTitle" TEXT;
ALTER TABLE "LinkTreeItem" ADD COLUMN "abWeight"       INTEGER NOT NULL DEFAULT 50;

-- FK: LinkTree → CustomDomain
ALTER TABLE "LinkTree"
  ADD CONSTRAINT "LinkTree_customDomainId_fkey"
  FOREIGN KEY ("customDomainId") REFERENCES "CustomDomain"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- FK: LinkTree → Team
ALTER TABLE "LinkTree"
  ADD CONSTRAINT "LinkTree_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "LinkTree_teamId_idx"         ON "LinkTree"("teamId");
CREATE INDEX "LinkTree_customDomainId_idx" ON "LinkTree"("customDomainId");
