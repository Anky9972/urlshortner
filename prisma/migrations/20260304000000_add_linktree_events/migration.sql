-- CreateTable
CREATE TABLE "LinkTreeEvent" (
    "id"         TEXT NOT NULL,
    "linkTreeId" TEXT NOT NULL,
    "linkItemId" TEXT,
    "eventType"  TEXT NOT NULL,
    "referrer"   TEXT,
    "device"     TEXT,
    "country"    TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkTreeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkTreeEvent_linkTreeId_createdAt_idx" ON "LinkTreeEvent"("linkTreeId", "createdAt");

-- CreateIndex
CREATE INDEX "LinkTreeEvent_linkItemId_idx" ON "LinkTreeEvent"("linkItemId");

-- AddForeignKey
ALTER TABLE "LinkTreeEvent" ADD CONSTRAINT "LinkTreeEvent_linkTreeId_fkey"
    FOREIGN KEY ("linkTreeId") REFERENCES "LinkTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;
