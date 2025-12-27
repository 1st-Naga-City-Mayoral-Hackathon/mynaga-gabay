'use client';

import type { MedicationCard, MedicationCardItem } from '@mynaga/shared';
import { AlertTriangle, Pill, Info } from 'lucide-react';

interface MedicationCardUIProps {
  card: MedicationCard;
}

function MedicationItem({ item }: { item: MedicationCardItem }) {
  return (
    <div className="border rounded-lg p-3 bg-white dark:bg-gray-800 mb-3 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <Pill className="w-4 h-4 text-gabay-orange-500" />
        <h4 className="font-semibold text-sm">{item.genericName}</h4>
      </div>

      {item.brandExamples && item.brandExamples.length > 0 && (
        <p className="text-xs text-muted-foreground mb-2">
          Brands: {item.brandExamples.join(', ')}
        </p>
      )}

      <p className="text-sm text-muted-foreground mb-2">
        <span className="font-medium">Why:</span> {item.why}
      </p>

      <p className="text-sm mb-2">
        <span className="font-medium">How to use:</span> {item.howToUseGeneral}
      </p>

      {item.cautions.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Cautions:
          </p>
          <ul className="text-xs text-muted-foreground list-disc pl-4">
            {item.cautions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {item.avoidIf.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Avoid if:
          </p>
          <ul className="text-xs text-muted-foreground list-disc pl-4">
            {item.avoidIf.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gabay-orange-600 dark:text-gabay-orange-400 mt-2">
        <Info className="w-3 h-3 inline mr-1" />
        {item.whenToSeeDoctor}
      </p>
    </div>
  );
}

export function MedicationCardUI({ card }: MedicationCardUIProps) {
  return (
    <div className="border-2 border-gabay-orange-200 dark:border-gabay-orange-800 rounded-xl p-4 bg-gabay-orange-50 dark:bg-gabay-orange-950/20 my-3">
      <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
        <Pill className="w-5 h-5 text-gabay-orange-500" />
        {card.title}
      </h3>

      <div className="space-y-2">
        {card.items.map((item, index) => (
          <MedicationItem key={index} item={item} />
        ))}
      </div>

      <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{card.generalDisclaimer}</span>
        </p>
      </div>
    </div>
  );
}
