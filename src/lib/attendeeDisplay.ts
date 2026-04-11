/**
 * Normalizes attendee RSVP fields for display.
 * Supports new columns (plus_one, plus_one_name, receiving_notes) and legacy `notes` text.
 */

export type AttendeeRow = {
  id: string;
  full_name: string;
  phone: string | null;
  relation: string;
  status: string;
  created_at: string;
  checked_in_at?: string | null;
  plus_one?: boolean | null;
  plus_one_name?: string | null;
  receiving_notes?: string | null;
  notes?: string | null;
  party_leader_id?: string | null;
};

const PLUS_LINE = /^Plus-one:\s*(.+)$/m;
const RECEIVING_LINE = /^Receiving \/ seating \/ meals:\s*(.+)$/m;

function parsePlusOneFromNotes(notes: string | null | undefined): {
  hasPlusOne: boolean;
  guestName: string | null;
} | null {
  const raw = notes?.trim();
  if (!raw) return null;
  const m = raw.match(PLUS_LINE);
  if (!m) return null;
  const rest = m[1].trim();
  if (rest.startsWith("No")) return { hasPlusOne: false, guestName: null };
  return { hasPlusOne: true, guestName: rest || null };
}

/** Prefer DB columns; fall back to legacy `notes` text when needed. */
export function getPlusOneInfo(a: AttendeeRow): { hasPlusOne: boolean; guestName: string | null } {
  if (a.plus_one === true) {
    const name = a.plus_one_name?.trim() || parsePlusOneFromNotes(a.notes)?.guestName || null;
    return { hasPlusOne: true, guestName: name };
  }
  const legacy = parsePlusOneFromNotes(a.notes);
  if (legacy?.hasPlusOne) return legacy;
  return { hasPlusOne: false, guestName: null };
}

export function getReceivingNotes(a: AttendeeRow): string | null {
  const fromCol = a.receiving_notes?.trim();
  if (fromCol) return fromCol;
  const raw = a.notes?.trim();
  if (!raw) return null;
  const m = raw.match(RECEIVING_LINE);
  return m ? m[1].trim() : null;
}

/** Total guests: companion rows are one person each; primaries without a companion row use plus_one for legacy pairs. */
export function totalEstimatedHeadcount(rows: AttendeeRow[]): number {
  return rows
    .filter((a) => !a.party_leader_id)
    .reduce((sum, a) => {
      const companions = rows.filter((r) => r.party_leader_id === a.id).length;
      if (companions > 0) return sum + 1 + companions;
      return sum + (getPlusOneInfo(a).hasPlusOne ? 2 : 1);
    }, 0);
}
