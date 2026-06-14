-- CreateTable
CREATE TABLE "Tick" (
    "id" BIGSERIAL NOT NULL,
    "symbol" TEXT NOT NULL,
    "bid" DOUBLE PRECISION NOT NULL,
    "ask" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tick_symbol_createdAt_idx" ON "Tick"("symbol", "createdAt");
