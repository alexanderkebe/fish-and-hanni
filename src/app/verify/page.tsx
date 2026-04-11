"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { type AttendeeRow, getPlusOneInfo, getReceivingNotes } from "@/lib/attendeeDisplay";

function formatCheckedInAt(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function VerificationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'error' | 'already_checked_in' | 'checking_in'>('loading');
  const [attendee, setAttendee] = useState<AttendeeRow | null>(null);
  const admittedViaButtonRef = useRef(false);
  const dupViewLoggedRef = useRef(false);

  useEffect(() => {
    admittedViaButtonRef.current = false;
    dupViewLoggedRef.current = false;
  }, [id]);

  useEffect(() => {
    if (!id) {
      setStatus('error');
      return;
    }

    async function checkId() {
      try {
        const { data, error } = await supabase
          .from('attendees')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error || !data) {
          setStatus('invalid');
          return;
        }

        setAttendee(data);
        if (data.status === 'checked_in') {
          setStatus('already_checked_in');
        } else {
          setStatus('valid');
        }
      } catch (err) {
        setStatus('error');
      }
    }

    checkId();
  }, [id]);

  useEffect(() => {
    if (status !== "already_checked_in" || !attendee?.id) return;
    if (admittedViaButtonRef.current || dupViewLoggedRef.current) return;
    dupViewLoggedRef.current = true;
    void fetch("/api/gate/duplicate-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendeeId: attendee.id }),
    }).catch(() => {
      dupViewLoggedRef.current = false;
    });
  }, [status, attendee?.id]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-label uppercase text-primary tracking-widest animate-pulse">Verifying Ticket...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold mb-2">Invalid Request</h2>
        <p className="text-sm text-on-surface-variant">No ticket ID was provided in the URL or an error occurred.</p>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">cancel</span>
        <h2 className="text-2xl font-bold mb-2">Invalid Ticket</h2>
        <p className="text-sm text-on-surface-variant bg-error-container text-on-error-container p-3 rounded-xl mt-2">
          This QR code is not registered in our system. Potential party crasher!
        </p>
      </div>
    );
  }

  if (status === 'already_checked_in') {
    return (
      <div className="flex flex-col items-center w-full">
        <span className="material-symbols-outlined text-6xl text-error mb-4">warning</span>
        <h2 className="text-2xl font-bold text-error mb-2 text-center leading-tight">Already<br/>Checked In!</h2>
        <p className="text-sm text-center text-on-surface-variant bg-error-container text-on-error-container p-3 rounded-xl mt-2 mb-4 shadow-sm border border-error/20 inline-block">
          This QR was already used at the gate. Do not admit again — this may be a screenshot, forwarded ticket, or imposter. The attempt is logged.
        </p>
        {attendee?.checked_in_at ? (
          <p className="text-xs font-label uppercase tracking-widest text-outline mb-4">
            First admitted:{" "}
            <span className="text-on-surface font-semibold normal-case tracking-normal">
              {formatCheckedInAt(attendee.checked_in_at)}
            </span>
          </p>
        ) : null}
        <div className="bg-surface-container/50 w-full p-4 rounded-2xl flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">Registered To</span>
            <p className="font-bold text-lg">{attendee?.full_name}</p>
            <p className="text-xs text-outline font-medium">{attendee?.relation}</p>
            {attendee && getPlusOneInfo(attendee).hasPlusOne && (
              <p className="text-xs text-on-surface-variant mt-2">
                +1: <span className="font-semibold text-primary">{getPlusOneInfo(attendee).guestName || "Guest"}</span>
              </p>
            )}
        </div>
        <Link
          href="/scanner"
          className="mt-8 text-xs font-label uppercase tracking-widest text-primary hover:underline"
        >
          ← Back to gate scanner
        </Link>
      </div>
    );
  }

  // VALID STATE
  if (!attendee) return null;
  const plus = getPlusOneInfo(attendee);
  const receiving = getReceivingNotes(attendee);

  return (
    <div className="flex flex-col items-center relative z-10 w-full animate-in zoom-in duration-500">
      <div className="bg-primary-container/20 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-primary drop-shadow-sm">verified</span>
      </div>
      
      <p className="text-xs font-label uppercase tracking-widest text-outline mb-1">Guest Verified</p>
      <h2 className="text-3xl font-notoSerif text-on-surface mb-6 text-center leading-tight">
        {attendee.full_name}
      </h2>
      
      <div className="w-full space-y-3 bg-surface-container/50 p-4 rounded-2xl mb-8">
        <div className="flex justify-between items-center gap-2 pb-2 border-b border-outline-variant/20">
          <span className="text-xs font-semibold uppercase text-on-surface-variant shrink-0">Relation</span>
          <span className="text-sm font-bold text-primary text-right">{attendee.relation}</span>
        </div>
        <div className="flex justify-between items-center gap-2 pb-2 border-b border-outline-variant/20">
          <span className="text-xs font-semibold uppercase text-on-surface-variant shrink-0">Phone</span>
          <span className="text-sm font-medium text-on-surface text-right">{attendee.phone || "N/A"}</span>
        </div>
        {plus.hasPlusOne && (
          <div className="flex justify-between items-start gap-2 pb-2 border-b border-outline-variant/20">
            <span className="text-xs font-semibold uppercase text-on-surface-variant shrink-0">Plus-one</span>
            <span className="text-sm font-medium text-on-surface text-right">
              {plus.guestName || "Guest"}
            </span>
          </div>
        )}
        {receiving && (
          <div className="flex flex-col gap-1 pt-0.5">
            <span className="text-xs font-semibold uppercase text-on-surface-variant">Receiving / seating</span>
            <span className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap">{receiving}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-1">
          <span className="text-xs font-semibold uppercase text-on-surface-variant">ID</span>
          <span className="text-[10px] font-mono text-outline truncate max-w-[150px]">
            {attendee.id.substring(0, 8)}...
          </span>
        </div>
      </div>
      
      <button 
        disabled={status === 'checking_in'}
        className={`w-full py-4 rounded-full text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-md flex justify-center items-center gap-2 ${
            status === 'checking_in' ? 'bg-surface-variant text-outline' : 'gold-gradient-btn text-white'
        }`}
        onClick={async () => {
          setStatus('checking_in');
          try {
            const res = await fetch("/api/gate/check-in", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ attendeeId: attendee.id }),
            });
            const payload = await res.json();

            if (res.ok && payload.attendee) {
              admittedViaButtonRef.current = true;
              setAttendee((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "checked_in",
                      checked_in_at: payload.attendee.checked_in_at,
                    }
                  : prev
              );
              setStatus("already_checked_in");
              return;
            }

            if (res.status === 409 && payload.attendee) {
              admittedViaButtonRef.current = true;
              setAttendee((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "checked_in",
                      checked_in_at: payload.attendee.checked_in_at ?? prev.checked_in_at,
                    }
                  : prev
              );
              setStatus("already_checked_in");
              return;
            }

            alert(
              "Check-in failed: " +
                (payload.error || res.statusText) +
                "\n\nConfirm Supabase policies allow update on attendees and run the gate migration (checked_in_at + check_in_logs)."
            );
            setStatus("valid");
          } catch (e: unknown) {
            alert(e instanceof Error ? e.message : "Network error");
            setStatus("valid");
          }
        }}
      >
        {status === 'checking_in' ? (
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-outline border-t-transparent rounded-full animate-spin"></div>
                Checking in...
            </div>
        ) : (
            <>
                <span className="material-symbols-outlined text-lg">how_to_reg</span>
                Check In Guest
            </>
        )}
      </button>

      <Link
        href="/scanner"
        className="mt-8 text-xs font-label uppercase tracking-widest text-primary hover:underline"
      >
        ← Back to gate scanner
      </Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen bg-surface-container relative flex items-center justify-center p-6 pb-20">
      {/* Decorative BG */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-secondary-container rounded-full blur-3xl"></div>
      </div>

      <div className="glass-card bg-surface/80 p-8 md:p-12 max-w-sm w-full rounded-[40px] shadow-2xl relative z-10 border border-white/50">
        <Suspense fallback={
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <VerificationContent />
        </Suspense>
      </div>
    </main>
  );
}
