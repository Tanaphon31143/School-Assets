import { db } from "@/lib/db";
export { isRepairPriority, isRepairStatus } from "@/lib/repair-types";

let schemaPromise: Promise<void> | undefined;

/** Ensures the additive fields used by the repair feature exist on TiDB/MySQL. */
export function ensureRepairSchema() {
  schemaPromise ??= (async () => {
    await db.query("ALTER TABLE equipment_maintenances ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'normal'");
    await db.query(`CREATE TABLE IF NOT EXISTS repair_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      repair_id BIGINT UNSIGNED NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      old_status VARCHAR(30) NOT NULL,
      new_status VARCHAR(30) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX repair_logs_repair_id_index (repair_id),
      INDEX repair_logs_user_id_index (user_id)
    )`);
  })();
  return schemaPromise;
}
