// Small, idempotent schema updates for databases created by an earlier version.
// `sequelize.sync()` creates missing tables but never changes existing ones, so new
// columns are added here. Every statement is safe to run on every start.
export const runMigrations = async (sequelize) => {
  const statements = [
    // v2.1 — username logins; email becomes optional
    'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" VARCHAR(40)',
    'CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users" ("username")',
    'ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL',
    // v2.1 — blog drafts, featured posts and excerpts
    'ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "excerpt" VARCHAR(400) NOT NULL DEFAULT \'\'',
    'ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT TRUE',
    'ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT FALSE'
  ];
  for (const sql of statements) {
    await sequelize.query(sql);
  }
};
