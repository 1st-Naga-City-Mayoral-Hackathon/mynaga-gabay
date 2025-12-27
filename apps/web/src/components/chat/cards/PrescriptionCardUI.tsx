import type { PrescriptionCard } from '@mynaga/shared';

export function PrescriptionCardUI({ card }: { card: PrescriptionCard }) {
  return (
    <div className="border rounded-xl p-4 bg-background">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">{card.title || 'Prescription scan'}</div>
          <div className="text-xs text-muted-foreground">
            Confidence: {card.confidence}
            {card.demo ? ' (demo)' : ''}
            {card.needsVerification ? ' • Needs verification' : ''}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {card.patientName && (
          <div>
            <div className="text-xs text-muted-foreground">Patient</div>
            <div className="font-medium">{card.patientName}</div>
          </div>
        )}
        {typeof card.age === 'number' && (
          <div>
            <div className="text-xs text-muted-foreground">Age</div>
            <div className="font-medium">{card.age}</div>
          </div>
        )}
        {card.date && (
          <div>
            <div className="text-xs text-muted-foreground">Date</div>
            <div className="font-medium">{card.date}</div>
          </div>
        )}
        {(card.prescriberName || card.prescriberLicense) && (
          <div>
            <div className="text-xs text-muted-foreground">Prescriber</div>
            <div className="font-medium">
              {card.prescriberName || '—'}
              {card.prescriberLicense ? ` (Lic. ${card.prescriberLicense})` : ''}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-xs text-muted-foreground mb-1">Rx</div>
        <div className="space-y-2">
          {card.items.map((item, idx) => (
            <div key={idx} className="rounded-lg border p-3">
              <div className="text-sm font-medium">
                {idx + 1}. {item.medicationName}
                {item.strength ? ` ${item.strength}` : ''}
                {item.form ? ` ${item.form}` : ''}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Sig:</span> {item.sig}
              </div>
              {(item.prn || item.durationDays || item.confidence) && (
                <div className="text-xs text-muted-foreground mt-1">
                  {item.prn ? 'PRN' : ''}
                  {item.durationDays ? `${item.prn ? ' • ' : ''}${item.durationDays} days` : ''}
                  {item.confidence ? `${item.prn || item.durationDays ? ' • ' : ''}${item.confidence}` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {card.warnings && card.warnings.length > 0 && (
        <div className="mt-3 rounded-lg border bg-muted/40 p-3">
          <div className="text-xs font-semibold mb-1">Notes / warnings</div>
          <ul className="list-disc pl-5 text-sm">
            {card.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}



