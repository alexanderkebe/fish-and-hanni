"use client";

import { useState, FormEvent } from "react";
import { buildTicketQrUrl } from "@/lib/weddingTicket";

export type RsvpSuccessPayload = {
  id: string;
  qrUrl: string;
  primaryName: string;
  plusOne?: { id: string; qrUrl: string; fullName: string };
};

interface RSVPFormProps {
  onSuccess: (data: RsvpSuccessPayload) => void;
}

export default function RSVPForm({ onSuccess }: RSVPFormProps) {
  const [step, setStep] = useState<"form" | "loading">("form");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    relation: "",
    plusOne: false,
    plusOneName: "",
    receivingNotes: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.relation) {
      setError("Please fill out your name and relation to the couple.");
      return;
    }
    if (formData.plusOne && !formData.plusOneName.trim()) {
      setError("Please enter your plus-one's name, or choose 'Just me' if you're attending alone.");
      return;
    }
    setError("");
    setStep("loading");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          relation: formData.relation,
          plusOne: formData.plusOne,
          plusOneName: formData.plusOne ? formData.plusOneName.trim() : "",
          receivingNotes: formData.receivingNotes.trim(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        attendee: { id: string };
        plusOneAttendee?: { id: string };
      };

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit RSVP");
      }

      const qrUrl = buildTicketQrUrl(window.location.origin, data.attendee.id);
      const base: RsvpSuccessPayload = {
        id: data.attendee.id,
        qrUrl,
        primaryName: formData.fullName.trim(),
      };

      if (data.plusOneAttendee?.id) {
        onSuccess({
          ...base,
          plusOne: {
            id: data.plusOneAttendee.id,
            qrUrl: buildTicketQrUrl(window.location.origin, data.plusOneAttendee.id),
            fullName: formData.plusOneName.trim(),
          },
        });
      } else {
        onSuccess(base);
      }
      setStep("form");
      setFormData({
        fullName: "",
        phone: "",
        relation: "",
        plusOne: false,
        plusOneName: "",
        receivingNotes: "",
      });
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("form");
    }
  };

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 w-full">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-label uppercase tracking-widest text-primary animate-pulse">Generating Ticket...</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 w-full min-w-0 max-w-full text-left box-border"
    >
      {error && (
        <div className="bg-error-container text-on-error-container text-xs p-3 rounded-xl border border-error/20">
          {error}
        </div>
      )}

      <div className="min-w-0">
        <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1 break-words">
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="E.g. Abel Tesfaye"
          className="w-full min-w-0 max-w-full box-border bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-4 sm:px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container"
        />
      </div>

      <div className="min-w-0">
        <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1 break-words">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+251 9..."
          className="w-full min-w-0 max-w-full box-border bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-4 sm:px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container"
        />
      </div>

      <div className="min-w-0">
        <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1 break-words">
          Relation to Couple
        </label>
        <select
          value={formData.relation}
          onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
          className="w-full min-w-0 max-w-full box-border bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-4 sm:px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container appearance-none"
        >
          <option value="" disabled>
            Select relation...
          </option>
          <option value="Bride's Family">Bride&apos;s Family</option>
          <option value="Bride's Friend">Bride&apos;s Friend</option>
          <option value="Groom's Family">Groom&apos;s Family</option>
          <option value="Groom's Friend">Groom&apos;s Friend</option>
          <option value="Mutual Friend">Mutual Friend</option>
          <option value="Coworker">Coworker</option>
        </select>
      </div>

      <div
        role="group"
        aria-label="Plus-one"
        className="min-w-0 w-full max-w-full overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container/50 p-3 sm:p-4 box-border"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2 break-words">
          Will you bring a plus-one?
        </p>
        <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3 break-words">
          We plan seats and meals per person. Let us know if someone is coming with you.
        </p>
        <div className="flex flex-col gap-2.5 min-w-0">
          <label className="flex items-start gap-3 cursor-pointer group min-w-0">
            <input
              type="radio"
              name="plusOne"
              checked={!formData.plusOne}
              onChange={() => setFormData({ ...formData, plusOne: false, plusOneName: "" })}
              className="size-4 accent-primary-container shrink-0 mt-0.5"
            />
            <span className="text-sm font-medium text-on-surface min-w-0 flex-1 break-words leading-snug">
              Just me
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group min-w-0">
            <input
              type="radio"
              name="plusOne"
              checked={formData.plusOne}
              onChange={() => setFormData({ ...formData, plusOne: true })}
              className="size-4 accent-primary-container shrink-0 mt-0.5"
            />
            <span className="text-sm font-medium text-on-surface min-w-0 flex-1 break-words leading-snug">
              Me + one guest
            </span>
          </label>
        </div>
        {formData.plusOne && (
          <div className="pt-3 mt-1 border-t border-outline-variant/20 min-w-0">
            <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 break-words">
              Plus-one full name
            </label>
            <input
              type="text"
              value={formData.plusOneName}
              onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })}
              placeholder="Guest's name as it should appear"
              className="w-full min-w-0 max-w-full box-border bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-4 sm:px-5 py-3.5 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container text-sm"
            />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1 break-words">
          Receiving &amp; seating (optional)
        </label>
        <p className="text-[11px] text-on-surface-variant mb-2 leading-relaxed break-words">
          Dietary needs, accessibility, children, or how you&apos;d like to be seated with family — anything that helps us host you.
        </p>
        <textarea
          value={formData.receivingNotes}
          onChange={(e) => setFormData({ ...formData, receivingNotes: e.target.value })}
          placeholder="E.g. vegetarian meal for my guest, or seated near the bride's family…"
          rows={3}
          className="w-full min-w-0 max-w-full box-border resize-y min-h-[88px] bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-4 sm:px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full min-w-0 max-w-full box-border gold-gradient-btn text-white font-semibold uppercase tracking-widest text-[13px] py-4 rounded-2xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2 flex-wrap"
      >
        <span
          className="material-symbols-outlined text-[22px]"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 24" }}
        >
          local_activity
        </span>
        Generate Digital Ticket
      </button>
    </form>
  );
}
