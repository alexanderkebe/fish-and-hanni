import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Call when gate staff opens /verify for a ticket that is already checked in
 * (e.g. imposter or second phone showing same QR). Appends an audit row.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const attendeeId = typeof body.attendeeId === "string" ? body.attendeeId.trim() : "";
    if (!UUID.test(attendeeId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { data: row, error } = await supabase
      .from("attendees")
      .select("id, status, full_name, checked_in_at")
      .eq("id", attendeeId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!row) {
      await supabase.from("check_in_logs").insert([
        {
          attendee_id: null,
          event_type: "invalid_ticket",
          meta: { scanned_id: attendeeId, source: "duplicate_scan_probe" },
        },
      ]);
      return NextResponse.json({ ok: false, reason: "not_found" });
    }

    if (row.status === "checked_in") {
      await supabase.from("check_in_logs").insert([
        {
          attendee_id: row.id,
          event_type: "duplicate_attempt",
          meta: {
            full_name: row.full_name,
            first_check_in: row.checked_in_at,
            source: "verify_screen_already_admitted",
          },
        },
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
