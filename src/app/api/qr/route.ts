import { NextResponse } from "next/server";

const LOOSE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function publicOrigin(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

/** Same-origin QR PNG so invites can be saved to the gallery without canvas taint. */
export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!LOOSE_UUID.test(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const verifyUrl = `${publicOrigin(request)}/verify?id=${encodeURIComponent(id)}`;
    const upstream = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(verifyUrl)}&color=775a19&bgcolor=ffffff`;

    const img = await fetch(upstream);
    if (!img.ok) {
      return NextResponse.json(
        { error: "Failed to generate QR" },
        { status: 502 }
      );
    }

    const buf = await img.arrayBuffer();
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
