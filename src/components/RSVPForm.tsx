"use client";

import { useState, FormEvent } from "react";

interface RSVPFormProps {
  onSuccess: (attendeeData: { id: string; qrUrl: string }) => void;
}

export default function RSVPForm({ onSuccess }: RSVPFormProps) {
  const [step, setStep] = useState<"form" | "loading">("form");
  const [formData, setFormData] = useState({ fullName: "", phone: "", relation: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.relation) {
      setError("Please fill out your name and relation to the couple.");
      return;
    }
    setError("");
    setStep("loading");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit RSVP");
      }

      const verifyUrl = `${window.location.origin}/verify?id=${data.attendee.id}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(verifyUrl)}&color=775a19&bgcolor=ffffff`;

      onSuccess({ id: data.attendee.id, qrUrl });
      setStep("form");
      setFormData({ fullName: "", phone: "", relation: "" });
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
    <form onSubmit={handleSubmit} className="space-y-5 w-full text-left">
      {error && (
        <div className="bg-error-container text-on-error-container text-xs p-3 rounded-xl border border-error/20">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
          Full Name
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="E.g. Abel Tesfaye"
          className="w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
          Phone Number (Optional)
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+251 9..."
          className="w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">
          Relation to Couple
        </label>
        <select
          value={formData.relation}
          onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
          className="w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container appearance-none"
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

      <button
        type="submit"
        className="w-full gold-gradient-btn text-white font-semibold uppercase tracking-widest text-[13px] py-4 rounded-2xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2"
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
