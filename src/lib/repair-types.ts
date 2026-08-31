export const repairStatuses = ["reported", "in_progress", "completed", "cannot_repair"] as const;
export const repairPriorities = ["normal", "medium", "urgent"] as const;

export type RepairStatus = (typeof repairStatuses)[number];
export type RepairPriority = (typeof repairPriorities)[number];

export const repairStatusLabels: Record<RepairStatus, string> = {
  reported: "รอดำเนินการ",
  in_progress: "กำลังซ่อม",
  completed: "ซ่อมเสร็จแล้ว",
  cannot_repair: "ไม่สามารถซ่อมได้",
};

export function isRepairStatus(value: unknown): value is RepairStatus {
  return typeof value === "string" && repairStatuses.includes(value as RepairStatus);
}

export function isRepairPriority(value: unknown): value is RepairPriority {
  return typeof value === "string" && repairPriorities.includes(value as RepairPriority);
}
