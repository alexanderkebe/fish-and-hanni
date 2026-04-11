/** Per-browser binding: one saved ticket ID → one QR (verified against DB on load). */

/** v1: single UUID string. v2: JSON `{"p":"<primary>","c":"<companion>"}` */
export const WEDDING_TICKET_STORAGE_KEY = "fandh_wedding_ticket_id_v1";

export type StoredTicketBundle = { primaryId: string; companionId?: string };

/** Loose UUID (Supabase / Postgres uses standard hyphenated hex; any version). */
const LOOSE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isProbableAttendeeId(value: string | null | undefined): value is string {
  return typeof value === "string" && LOOSE_UUID_RE.test(value.trim());
}

function parseStoredBundle(raw: string | null): StoredTicketBundle | null {
  if (!raw?.trim()) return null;
  const t = raw.trim();
  if (isProbableAttendeeId(t)) {
    return { primaryId: t.toLowerCase() };
  }
  try {
    const j = JSON.parse(t) as { p?: string; c?: string };
    const p = typeof j.p === "string" && isProbableAttendeeId(j.p) ? j.p.toLowerCase() : null;
    if (!p) return null;
    const c =
      typeof j.c === "string" && isProbableAttendeeId(j.c) ? j.c.toLowerCase() : undefined;
    return { primaryId: p, companionId: c };
  } catch {
    return null;
  }
}

/** Primary guest id (for DB restore). */
export function readStoredTicketId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredBundle(localStorage.getItem(WEDDING_TICKET_STORAGE_KEY))?.primaryId ?? null;
  } catch {
    return null;
  }
}

export function readStoredTicketBundle(): StoredTicketBundle | null {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredBundle(localStorage.getItem(WEDDING_TICKET_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function persistTicketBundle(bundle: StoredTicketBundle): void {
  if (typeof window === "undefined") return;
  const p = String(bundle.primaryId).trim().toLowerCase();
  if (!isProbableAttendeeId(p)) return;
  const c = bundle.companionId?.trim().toLowerCase();
  try {
    if (c && isProbableAttendeeId(c)) {
      localStorage.setItem(WEDDING_TICKET_STORAGE_KEY, JSON.stringify({ p, c }));
    } else {
      localStorage.setItem(WEDDING_TICKET_STORAGE_KEY, p);
    }
  } catch {
    /* private mode / quota */
  }
}

export function persistTicketId(id: string): void {
  persistTicketBundle({ primaryId: id });
}

export function clearStoredTicketId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WEDDING_TICKET_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Same-origin `/api/qr` so QRs are not canvas-tainted when saving the invite as an image. */
export function buildTicketQrUrl(origin: string, attendeeId: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/qr?id=${encodeURIComponent(attendeeId)}`;
}
