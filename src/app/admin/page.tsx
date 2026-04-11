"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type AttendeeRow,
  getPlusOneInfo,
  getReceivingNotes,
  totalEstimatedHeadcount,
} from "@/lib/attendeeDisplay";

export default function AdminDashboard() {
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "fishandhanni2026") {
      setAuth(true);
      fetchAttendees();
    } else {
      alert("Incorrect password!");
    }
  };

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attendees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAttendees((data as AttendeeRow[]) || []);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    }
    setLoading(false);
  };

  const handleBan = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you absolutely sure you want to ban and remove ${name}? Their QR code will no longer work.`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("attendees").delete().eq("id", id);

      if (error) throw error;

      setAttendees(attendees.filter((a) => a.id !== id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(
        "Error removing attendee. Did you remember to add the SQL DELETE policy in Supabase?\n\nError: " +
          msg
      );
    }
  };

  const headcount = totalEstimatedHeadcount(attendees);
  const withPlusOne = attendees.filter((a) => getPlusOneInfo(a).hasPlusOne).length;

  if (!auth) {
    return (
      <main className="min-h-screen bg-surface-container flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="glass-card p-10 rounded-[32px] max-w-sm w-full text-center shadow-xl"
        >
          <span className="material-symbols-outlined text-5xl text-primary mb-4">
            admin_panel_settings
          </span>
          <h2 className="text-2xl font-bold mb-6 text-on-surface">Admin Access</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full bg-surface-container-highest px-4 py-3 rounded-xl mb-4 outline-none border border-transparent focus:border-primary-container"
          />
          <button
            type="submit"
            className="w-full gold-gradient-btn text-white py-3 rounded-xl font-semibold uppercase tracking-widest text-sm"
          >
            Login
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container p-6 md:p-12">
      <div className="max-w-[min(100%,88rem)] mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-cursive text-primary-container drop-shadow-sm">
              Guest List Manager
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm font-label uppercase tracking-widest text-outline">
              <span>
                Registrations:{" "}
                <strong className="text-on-surface">{attendees.length}</strong>
              </span>
              <span>
                Est. headcount:{" "}
                <strong className="text-on-surface">{headcount}</strong>
              </span>
              <span>
                With +1:{" "}
                <strong className="text-on-surface">{withPlusOne}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={fetchAttendees}
            className="flex items-center gap-2 bg-surface hover:bg-surface-variant text-on-surface px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-colors self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh List
          </button>
        </div>

        <div className="glass-card rounded-[32px] shadow-lg overflow-hidden border border-outline-variant/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-primary/5 text-on-surface-variant text-[10px] md:text-xs uppercase tracking-widest font-semibold border-b border-outline-variant/30">
                  <th className="px-4 py-3 whitespace-nowrap">Guest</th>
                  <th className="px-4 py-3 whitespace-nowrap">Relation</th>
                  <th className="px-4 py-3 whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 whitespace-nowrap text-center">+1?</th>
                  <th className="px-4 py-3 min-w-[120px]">+1 name</th>
                  <th className="px-4 py-3 min-w-[160px]">Receiving / seating</th>
                  <th className="px-4 py-3 min-w-[140px]">Notes (legacy)</th>
                  <th className="px-4 py-3 whitespace-nowrap">Registered</th>
                  <th className="px-4 py-3 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-on-surface-variant">
                      <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      Loading guests...
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                      No guests have RSVP&apos;d yet!
                    </td>
                  </tr>
                ) : (
                  attendees.map((attendee) => {
                    const { hasPlusOne, guestName } = getPlusOneInfo(attendee);
                    const receiving = getReceivingNotes(attendee);
                    const legacyNotes = attendee.notes?.trim() || "";

                    return (
                      <tr
                        key={attendee.id}
                        className="border-b border-outline-variant/20 hover:bg-surface/50 transition-colors align-top"
                      >
                        <td className="px-4 py-3">
                          <div className="font-bold text-on-surface text-sm">
                            {attendee.full_name}
                          </div>
                          <div className="text-[10px] text-outline font-mono mt-1">
                            ID: {attendee.id.substring(0, 8)}…
                          </div>
                          <div className="text-[10px] text-outline mt-0.5 capitalize">
                            {attendee.status?.replace("_", " ") || "—"}
                          </div>
                          {attendee.party_leader_id ? (
                            <div className="text-[9px] text-primary font-semibold mt-1 uppercase tracking-wider">
                              Own QR (plus-one)
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-secondary-container/50 text-on-secondary-container px-2.5 py-1 rounded-full text-xs font-medium inline-block max-w-[140px] break-words">
                            {attendee.relation}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                          {attendee.phone || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                              hasPlusOne
                                ? "bg-primary-container/35 text-on-primary-container"
                                : "bg-surface-variant text-outline"
                            }`}
                          >
                            {hasPlusOne ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">
                          {hasPlusOne ? guestName || "—" : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[220px]">
                          <span className="whitespace-pre-wrap leading-relaxed block">
                            {receiving || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-outline max-w-[200px]">
                          {legacyNotes ? (
                            <span className="whitespace-pre-wrap leading-relaxed block">
                              {legacyNotes}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-outline whitespace-nowrap">
                          {new Date(attendee.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleBan(attendee.id, attendee.full_name)}
                            className="text-error hover:bg-error-container hover:text-on-error-container p-2 rounded-full transition-colors inline-flex"
                            title="Ban / Remove Guest"
                          >
                            <span className="material-symbols-outlined">person_remove</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 text-xs text-on-surface-variant max-w-2xl leading-relaxed">
          Database columns: <code className="text-[11px] bg-surface-variant/80 px-1 rounded">plus_one</code>,{" "}
          <code className="text-[11px] bg-surface-variant/80 px-1 rounded">plus_one_name</code>,{" "}
          <code className="text-[11px] bg-surface-variant/80 px-1 rounded">receiving_notes</code>. Run{" "}
          <code className="text-[11px] bg-surface-variant/80 px-1 rounded">
            supabase/migrations/20260411120000_attendees_rsvp_columns.sql
          </code>{" "}
          in the Supabase SQL editor if RSVPs fail to save.
        </p>
      </div>
    </main>
  );
}
