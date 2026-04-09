"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function VerificationContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'error'>('loading');
  const [attendee, setAttendee] = useState<any>(null);

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
        setStatus('valid');
      } catch (err) {
        setStatus('error');
      }
    }

    checkId();
  }, [id]);

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

  // VALID STATE
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
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <span className="text-xs font-semibold uppercase text-on-surface-variant">Relation</span>
          <span className="text-sm font-bold text-primary">{attendee.relation}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <span className="text-xs font-semibold uppercase text-on-surface-variant">Phone</span>
          <span className="text-sm font-medium text-on-surface">{attendee.phone || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase text-on-surface-variant">ID</span>
          <span className="text-[10px] font-mono text-outline truncate max-w-[150px]">{attendee.id.substring(0, 8)}...</span>
        </div>
      </div>
      
      <button 
        className="w-full bg-surface-container hover:bg-surface-variant text-on-surface py-3 rounded-full text-sm font-semibold transition-colors flex justify-center gap-2"
        onClick={() => {
            // Check in logic could go here
            alert("Guest checked in!");
        }}
      >
        <span className="material-symbols-outlined">how_to_reg</span>
        Check In Guest
      </button>
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
