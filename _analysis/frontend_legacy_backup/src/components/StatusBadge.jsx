import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility to merge tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatusBadge({ status, className }) {
  let colorClass = 'badge-slate'; // Default
  let label = status?.replace(/_/g, ' ') || 'Unknown';

  if (!status) return null;

  // Regulatory Status
  if (status === 'prescription_only') colorClass = 'badge-red';
  if (status === 'otc') colorClass = 'badge-green';
  if (status === 'controlled') colorClass = 'badge-amber';

  // Reorder Status
  if (status === 'normal') colorClass = 'badge-green';
  if (status === 'low') colorClass = 'badge-amber';
  if (status === 'critical') colorClass = 'badge-red';
  if (status === 'on_order') colorClass = 'badge-blue';

  // Risk Grade
  if (status === 'grade_1_minimal') colorClass = 'badge-green';
  if (status === 'grade_2_moderate') colorClass = 'badge-blue';
  if (status === 'grade_3_severe') colorClass = 'badge-amber';
  if (status === 'grade_4_contraindicated') colorClass = 'badge-red';

  // Evidence Level
  if (status === 'established') colorClass = 'badge-green';
  if (status === 'theoretical') colorClass = 'badge-amber';
  if (status === 'case_report') colorClass = 'badge-blue';

  // Alert Type
  if (status === 'temperature_out_of_range') colorClass = 'badge-red';
  if (status === 'humidity_out_of_range') colorClass = 'badge-amber';
  if (status === 'inventory_threshold_breached') { colorClass = 'badge-amber'; label = 'threshold breached'; }

  return (
    <span className={cn('badge uppercase tracking-wider', colorClass, className)}>
      {label}
    </span>
  );
}
