import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function logEvent(
  attendeeId: string | null,
  eventType: "admitted" | "duplicate_attempt" | "invalid_ticket",
  meta: Record<string, unknown> = {}
) {
  const { error } = await supabase.from("check_in_logs").insert([
    {
      attendee_id: attendeeId,
      event_type: eventType,
      meta,
    },
  ]);
  if (error) {
    console.error("[gate/check-in] log insert:", error.message);
  }
}

/**
 * Atomic check-in + audit. Use from /verify so staff devices don’t rely on fragile multi-step client updates.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const attendeeId = typeof body.attendeeId === "string" ? body.attendeeId.trim() : "";
    if (!UUID.test(attendeeId)) {
      await logEvent(null, "invalid_ticket", { reason: "bad_uuid" });
      return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
    }

    const { data: row, error: fetchErr } = await supabase
      .from("attendees")
      .select("id, full_name, status, checked_in_at")
      .eq("id", attendeeId)
      .maybeSingle();

    if (fetchErr) {
      console.error("[gate/check-in] fetch:", fetchErr.message);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!row) {
      await logEvent(null, "invalid_ticket", { scanned_id: attendeeId });
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (row.status === "checked_in") {
      await logEvent(row.id, "duplicate_attempt", {
        full_name: row.full_name,
        first_check_in: row.checked_in_at,
      });
      return NextResponse.json(
        {
          error: "already_checked_in",
          attendee: {
            id: row.id,
            full_name: row.full_name,
            checked_in_at: row.checked_in_at,
          },
        },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const { data: updated, error: updErr } = await supabase
      .from("attendees")
      .update({ status: "checked_in", checked_in_at: now })
      .eq("id", attendeeId)
      .eq("status", "attending")
      .select("id")
      .maybeSingle();

    if (updErr) {
      console.error("[gate/check-in] update:", updErr.message);
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    if (!updated) {
      const { data: again } = await supabase
        .from("attendees")
        .select("id, full_name, status, checked_in_at")
        .eq("id", attendeeId)
        .maybeSingle();
      if (again?.status === "checked_in") {
        await logEvent(again.id, "duplicate_attempt", {
          full_name: again.full_name,
          first_check_in: again.checked_in_at,
          note: "race_or_double_tap",
        });
        return NextResponse.json(
          {
            error: "already_checked_in",
            attendee: {
              id: again.id,
              full_name: again.full_name,
              checked_in_at: again.checked_in_at,
            },
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
    }

    await logEvent(row.id, "admitted", { full_name: row.full_name, at: now });

    return NextResponse.json({
      ok: true,
      attendee: { id: row.id, full_name: row.full_name, checked_in_at: now },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
