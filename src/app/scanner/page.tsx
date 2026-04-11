"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scanner } from "@yudiel/react-qr-scanner";
import { supabase } from "@/lib/supabase";

type CheckedInRow = {
  id: string;
  full_name: string;
  checked_in_at: string | null;
  party_leader_id: string | null;
};

export default function ScannerPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);
  const [checkedIn, setCheckedIn] = useState<CheckedInRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const fetchCheckedIn = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("attendees")
        .select("id, full_name, checked_in_at, party_leader_id")
        .eq("status", "checked_in")
        .order("checked_in_at", { ascending: false })
        .limit(120);

      if (error) throw error;
      setCheckedIn((data as CheckedInRow[]) || []);
      setListError(null);
    } catch (e: unknown) {
      setListError(e instanceof Error ? e.message : "Could not load list");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCheckedIn();
    const t = setInterval(() => void fetchCheckedIn(), 8000);
    return () => clearInterval(t);
  }, [fetchCheckedIn]);

  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const text = detectedCodes[0].rawValue;
      if (text) {
        setScanning(false);
        try {
          const url = new URL(text);

          if (url.pathname === "/verify") {
            void fetchCheckedIn();
            router.push(`${url.pathname}${url.search}`);
          } else {
            alert("Invalid QR Code: Not an official wedding ticket!");
            setTimeout(() => setScanning(true), 2500);
          }
        } catch {
          alert("Invalid format: Fake ticket or unknown QR.");
          setTimeout(() => setScanning(true), 2500);
        }
      }
    }
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <main className="min-h-screen bg-surface-container flex flex-col items-center p-4 pb-24 md:pb-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="glass-card w-full rounded-[40px] overflow-hidden shadow-2xl p-6 text-center border border-white/50">
          <span className="material-symbols-outlined text-5xl text-primary mb-2">qr_code_scanner</span>
          <h1 className="text-3xl font-cursive text-primary-container mb-1">Gate Scanner</h1>
          <p className="text-xs font-label text-outline mb-4 uppercase tracking-widest">
            Scan a ticket QR — opens verify to admit
          </p>

          <div className="rounded-3xl overflow-hidden shadow-inner aspect-square w-full bg-black relative flex items-center justify-center border-4 border-surface-variant max-h-[min(72vw,320px)] mx-auto">
            {scanning ? (
              <Scanner
                onScan={handleScan}
                formats={["qr_code"]}
                onError={(error: unknown) =>
                  console.log(
                    "Scanner minor error:",
                    error instanceof Error ? error.message : error
                  )
                }
              />
            ) : (
              <div className="text-primary-container animate-pulse flex flex-col items-center p-6">
                <span className="material-symbols-outlined text-6xl mb-3">hourglass_empty</span>
                <p className="font-label uppercase tracking-widest text-sm">Opening verify…</p>
              </div>
            )}

            {scanning && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-xl" />
                  <div className="w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-xl" />
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-xl" />
                  <div className="w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-xl" />
                </div>
              </div>
            )}
          </div>

          <p className="text-xs font-notoSerif text-on-surface-variant italic mt-4 opacity-80">
            Bright screen helps. Already-used QRs show a warning on the next screen — duplicates are logged.
          </p>

          <button
            type="button"
            onClick={() => {
              setListLoading(true);
              void fetchCheckedIn();
            }}
            className="mt-4 text-xs font-label uppercase tracking-widest text-primary hover:underline"
          >
            Refresh guest list
          </button>
        </div>

        <div className="glass-card rounded-[32px] border border-outline-variant/30 p-5 w-full">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-sm font-label uppercase tracking-[0.2em] text-outline">
              Admitted guests
            </h2>
            <span className="text-xs text-on-surface-variant font-semibold">{checkedIn.length}</span>
          </div>
          {listError && (
            <p className="text-xs text-error mb-2">{listError}</p>
          )}
          {listLoading && checkedIn.length === 0 ? (
            <div className="flex items-center gap-2 text-on-surface-variant text-sm py-8 justify-center">
              <div className="w-5 h-5 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
              Loading…
            </div>
          ) : checkedIn.length === 0 ? (
            <p className="text-sm text-on-surface-variant text-center py-6">
              No one checked in yet. Admissions appear here live.
            </p>
          ) : (
            <ul className="max-h-[min(50vh,420px)] overflow-y-auto space-y-2 pr-1">
              {checkedIn.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-surface/80 px-3 py-2.5 border border-outline-variant/20"
                >
                  <div className="min-w-0 text-left">
                    <p className="font-semibold text-on-surface text-sm truncate">{row.full_name}</p>
                    {row.party_leader_id ? (
                      <p className="text-[10px] text-primary font-semibold uppercase tracking-wider mt-0.5">
                        Plus-one ticket
                      </p>
                    ) : null}
                  </div>
                  <span className="text-[11px] text-outline whitespace-nowrap shrink-0 font-mono">
                    {formatTime(row.checked_in_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/"
          className="text-center text-xs text-on-surface-variant underline underline-offset-2"
        >
          Back to invitation
        </Link>
      </div>
    </main>
  );
}
