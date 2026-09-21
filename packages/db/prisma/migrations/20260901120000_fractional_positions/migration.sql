-- Fractional order keys: position Int -> String.

-- Old integer scheme required shifting every sibling row per move, which
-- raced under concurrent moves and produced duplicate positions (fixed
-- below). With fractional keys a move is a single-row update.

-- AlterTable
ALTER TABLE "Issue" ALTER COLUMN "position" DROP DEFAULT;
ALTER TABLE "Issue" ALTER COLUMN "position" TYPE TEXT USING position::text;

-- Fail loudly if any section has more than 36 issues (one-letter fraction
-- keys exhausted); extend the backfill scheme before proceeding.
DO $$
DECLARE max_rn INTEGER;
BEGIN
  SELECT MAX(cnt) - 1 INTO max_rn FROM (
    SELECT COUNT(*) AS cnt FROM "Issue" GROUP BY "sectionId"
  ) t;
  IF max_rn >= 36 THEN
    RAISE EXCEPTION 'Section with more than 36 issues found (max rn=%); extend backfill scheme', max_rn;
  END IF;
END $$;

-- Backfill: re-key each section in its current order using canonical
-- fractional-indexing keys (a0..a9, aA..aZ, aa..az). ROW_NUMBER also
-- repairs sections whose integer positions were corrupted by races.
WITH digits AS (
  SELECT '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' AS d
),
ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "sectionId"
      ORDER BY CAST(position AS INTEGER) ASC, "createdAt" ASC, id ASC
    ) - 1 AS rn
  FROM "Issue"
)
UPDATE "Issue" AS i
SET position = 'a' || substr(digits.d, (r.rn + 1)::integer, 1)
FROM ranked AS r, digits
WHERE i.id = r.id;

-- CreateIndex
-- The DB now enforces that two issues in one section can never share an
-- order key: concurrent moves/creates fail loudly (P2002) instead of
-- silently corrupting column order.
CREATE UNIQUE INDEX "Issue_sectionId_position_key" ON "Issue"("sectionId", "position");
