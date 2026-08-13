export type MaintenanceStatus = "reported" | "in_progress" | "completed" | "cannot_repair";

type StatusPresentation = {
  label: string;
  icon: string;
  badgeClassName: string;
  selectClassName: string;
};

const statusPresentation: Record<MaintenanceStatus, StatusPresentation> = {
  reported: {
    label: "แจ้งใหม่",
    icon: "●",
    badgeClassName: "bg-blue-100 text-blue-700",
    selectClassName: "border-blue-300 bg-blue-50 text-blue-700",
  },
  in_progress: {
    label: "กำลังซ่อม",
    icon: "◐",
    badgeClassName: "bg-amber-100 text-amber-700",
    selectClassName: "border-amber-300 bg-amber-50 text-amber-700",
  },
  completed: {
    label: "ซ่อมเสร็จแล้ว",
    icon: "✓",
    badgeClassName: "bg-green-100 text-green-700",
    selectClassName: "border-green-300 bg-green-50 text-green-700",
  },
  cannot_repair: {
    label: "ซ่อมไม่ได้",
    icon: "✕",
    badgeClassName: "bg-red-100 text-red-700",
    selectClassName: "border-red-300 bg-red-50 text-red-700",
  },
};

export const maintenanceStatuses = Object.keys(statusPresentation) as MaintenanceStatus[];

export function getStatusColor(status: string): StatusPresentation {
  return statusPresentation[status as MaintenanceStatus] ?? statusPresentation.reported;
}
