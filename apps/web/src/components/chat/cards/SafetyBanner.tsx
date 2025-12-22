'use client';

import type { SafetyInfo } from '@mynaga/shared';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface SafetyBannerProps {
  safety: SafetyInfo;
}

function getUrgencyConfig(urgency?: SafetyInfo['urgency']) {
  switch (urgency) {
    case 'er':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700',
        textColor: 'text-red-800 dark:text-red-200',
        iconColor: 'text-red-600 dark:text-red-400',
      };
    case 'clinic':
      return {
        icon: AlertCircle,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700',
        textColor: 'text-amber-800 dark:text-amber-200',
        iconColor: 'text-amber-600 dark:text-amber-400',
      };
    case 'self_care':
    default:
      return {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-800 dark:text-blue-200',
        iconColor: 'text-blue-600 dark:text-blue-400',
      };
  }
}

export function SafetyBanner({ safety }: SafetyBannerProps) {
  const config = getUrgencyConfig(safety.urgency);
  const Icon = config.icon;

  // Don't render if no meaningful content
  if (!safety.disclaimer && (!safety.redFlags || safety.redFlags.length === 0)) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border p-3 my-3 ${config.bgColor}`}
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1">
          {safety.redFlags && safety.redFlags.length > 0 && (
            <div className="mb-2">
              <p className={`text-sm font-medium ${config.textColor} mb-1`}>
                {safety.urgency === 'er'
                  ? 'Warning - Seek immediate medical attention:'
                  : 'Important observations:'}
              </p>
              <ul className={`text-xs ${config.textColor} list-disc pl-4 space-y-0.5`}>
                {safety.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {safety.disclaimer && (
            <p className={`text-xs ${config.textColor}`}>{safety.disclaimer}</p>
          )}
        </div>
      </div>
    </div>
  );
}
