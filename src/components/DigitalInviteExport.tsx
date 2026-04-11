"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

export type InviteTicketSlot = {
  id: string;
  qrUrl: string;
  title: string;
  subtitle?: string;
};

type DigitalInviteExportProps = {
  slots: InviteTicketSlot[];
  primaryGuestName: string;
};

export default function DigitalInviteExport({ slots, primaryGuestName }: DigitalInviteExportProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const saveAsImage = async () => {
    const el = exportRef.current;
    if (!el) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#faf9f6",
        logging: false,
        useCORS: true,
        allowTaint: false,
      });

      const fileName = "fish-and-hanni-invite.png";
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 0.95)
      );

      if (!blob) {
        throw new Error("No image blob");
      }

      const file = new File([blob], fileName, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Fish & Hanni — Wedding invite",
          text: "Save to Photos or Files",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileName;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error(e);
      alert("Could not create the image. Try a screenshot instead.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div
        ref={exportRef}
        className="w-full max-w-lg mx-auto rounded-[32px] border border-[#e3e2e0] bg-[#faf9f6] p-8 shadow-sm box-border"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        <p className="text-center text-[10px] uppercase tracking-[0.35em] text-[#775a19] mb-2 font-sans">
          You&apos;re invited
        </p>
        <h2 className="text-center text-3xl text-[#5b4000] mb-1" style={{ fontFamily: "cursive, serif" }}>
          Fish &amp; Hanni
        </h2>
        <p className="text-center text-xs text-[#4d4635] mb-8 font-sans">
          Digital entrance passes for <span className="font-semibold">{primaryGuestName}</span>
        </p>

        <div
          className={`grid gap-8 ${slots.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 place-items-center"}`}
        >
          {slots.map((slot) => (
            <div key={slot.id} className="flex flex-col items-center text-center min-w-0">
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#775a19] mb-1">
                {slot.title}
              </p>
              {slot.subtitle ? (
                <p className="text-[11px] text-[#4d4635] mb-3 font-sans line-clamp-2 px-1">{slot.subtitle}</p>
              ) : null}
              <div className="rounded-2xl bg-white p-2 shadow-inner border border-[#e3e2e0]">
                <img
                  src={slot.qrUrl}
                  alt=""
                  width={180}
                  height={180}
                  className="w-[180px] h-[180px] object-contain"
                  crossOrigin="anonymous"
                />
              </div>
              <p className="text-[9px] font-mono text-[#6e6147] mt-2 break-all max-w-[200px]">{slot.id}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[10px] text-[#6e6147] mt-8 font-sans leading-relaxed px-2">
          Present each QR at the gate. One scan per guest.
        </p>
      </div>

      <button
        type="button"
        onClick={saveAsImage}
        disabled={saving}
        className="gold-gradient-btn text-white font-label uppercase tracking-widest text-xs py-4 px-8 rounded-full shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
      >
        <span className="material-symbols-outlined text-lg">download</span>
        {saving ? "Saving…" : "Save invite as picture"}
      </button>
    </div>
  );
}
