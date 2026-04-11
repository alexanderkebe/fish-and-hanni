import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Confirms a ticket id still exists in the database (for restoring QR on this device).
 */
export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    const uuidOk =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!uuidOk) {
      return NextResponse.json({ error: "Invalid ticket id" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("attendees")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[rsvp/ticket] supabase:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data?.id) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ id: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
