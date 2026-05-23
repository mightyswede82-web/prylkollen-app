import { getDb } from "../db";

/**
 * Runs pending database migrations at server startup.
 * Uses a simple migrations table to track which migrations have been applied.
 */
export async function runMigrations(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Migrations] Database not available, skipping migrations");
    return;
  }

  try {
    // Ensure migrations tracking table exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS \`_migrations\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`appliedAt\` timestamp NOT NULL DEFAULT (now()),
        CONSTRAINT \`_migrations_id\` PRIMARY KEY(\`id\`),
        CONSTRAINT \`_migrations_name_unique\` UNIQUE(\`name\`)
      )
    `);

    // List of migrations to apply in order
    const migrations: { name: string; sql: string[] }[] = [
      {
        name: "0002_add_item_details",
        sql: [
          "ALTER TABLE `items` ADD COLUMN IF NOT EXISTS `category` varchar(100)",
          "ALTER TABLE `items` ADD COLUMN IF NOT EXISTS `condition` varchar(50)",
          "ALTER TABLE `items` ADD COLUMN IF NOT EXISTS `marketInsight` text",
        ],
      },
    ];

    for (const migration of migrations) {
      // Check if already applied
      const result = await db.execute(
        `SELECT id FROM \`_migrations\` WHERE name = '${migration.name}' LIMIT 1`
      );
      const rows = result[0] as unknown[];
      if (rows.length > 0) {
        console.log(`[Migrations] Already applied: ${migration.name}`);
        continue;
      }

      console.log(`[Migrations] Applying: ${migration.name}`);
      for (const sql of migration.sql) {
        try {
          await db.execute(sql);
        } catch (err: unknown) {
          // Column might already exist (MySQL doesn't support IF NOT EXISTS for ALTER TABLE in all versions)
          const msg = (err as Error).message || "";
          if (msg.includes("Duplicate column") || msg.includes("already exists")) {
            console.log(`[Migrations] Column already exists, skipping: ${sql.substring(0, 60)}`);
          } else {
            throw err;
          }
        }
      }

      // Mark as applied
      await db.execute(
        `INSERT INTO \`_migrations\` (name) VALUES ('${migration.name}')`
      );
      console.log(`[Migrations] Applied: ${migration.name}`);
    }

    console.log("[Migrations] All migrations up to date");
  } catch (error) {
    console.error("[Migrations] Error running migrations:", error);
    // Don't throw - let server start anyway
  }
}
