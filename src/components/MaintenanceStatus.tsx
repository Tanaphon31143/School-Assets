"use client";

import { useState } from "react";
import { getStatusColor, maintenanceStatuses } from "@/lib/maintenance-status";

export function MaintenanceStatusBadge({ status }: { status: string }) {
  const presentation = getStatusColor(status);
  return <span className={`inline-flex h-fit w-fit self-start items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ${presentation.badgeClassName}`}><span aria-hidden="true">{presentation.icon}</span>{presentation.label}</span>;
}

export function MaintenanceStatusSelect({ status }: { status: string }) {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const presentation = getStatusColor(selectedStatus);
  return <select name="status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className={`rounded-lg border px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 ${presentation.selectClassName}`}>
    {maintenanceStatuses.map((value) => <option key={value} value={value}>{getStatusColor(value).label}</option>)}
  </select>;
}
