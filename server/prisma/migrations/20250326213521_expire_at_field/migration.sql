-- AlterTable
ALTER TABLE "stories" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '24 hours';
