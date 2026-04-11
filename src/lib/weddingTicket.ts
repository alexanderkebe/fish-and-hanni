/** Per-browser binding: one saved ticket ID → one QR (verified against DB on load). */

export const WEDDING_TICKET_STORAGE_KEY = "fandh_wedding_ticket_id_v1";

/** Loose UUID (Supabase / Postgres uses standard hyphenated hex; any version). */
const LOOSE_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isProbableAttendeeId(value: string | null | undefined): value is string {
  return typeof value === "string" && LOOSE_UUID_RE.test(value.trim());
}

export function readStoredTicketId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WEDDING_TICKET_STORAGE_KEY);
    const id = raw?.trim() ?? "";
    return isProbableAttendeeId(id) ? id.toLowerCase() : null;
  } catch {
    return null;
  }
}

export function persistTicketId(id: string): void {
  if (typeof window === "undefined") return;
  const t = String(id).trim();
  if (!isProbableAttendeeId(t)) return;
  try {
    localStorage.setItem(WEDDING_TICKET_STORAGE_KEY, t.toLowerCase());
  } catch {
    /* private mode / quota */
  }
}

export function clearStoredTicketId(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WEDDING_TICKET_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildTicketQrUrl(origin: string, attendeeId: string): string {
  const verifyUrl = `${origin.replace(/\/$/, "")}/verify?id=${attendeeId}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(verifyUrl)}&color=775a19&bgcolor=ffffff`;
}
