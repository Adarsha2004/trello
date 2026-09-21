import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma, Prisma };

// Matches Prisma known-request errors (e.g. P2002 unique violation, P2025
// record not found) without importing the generated error class — avoids
// instanceof breaking across duplicated generated-client copies in the
// monorepo. Postgres SQLSTATE codes ("23505") never match the P-prefixed
// Prisma codes, so exact comparison is safe.
export function isPrismaErrorCode(e: unknown, code: string): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: unknown }).code === code
  );
}
