"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");

  // Simple hardcoded password to prevent guests from finding this page and deleting people
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
        .from('attendees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAttendees(data || []);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    }
    setLoading(false);
  };

  const handleBan = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to ban and remove ${name}? Their QR code will no longer work.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('attendees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove from UI state
      setAttendees(attendees.filter(a => a.id !== id));
    } catch (err: any) {
      alert("Error removing attendee. Did you remember to add the SQL DELETE policy in Supabase?\n\nError: " + err.message);
    }
  };

  if (!auth) {
    return (
      <main className="min-h-screen bg-surface-container flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="glass-card p-10 rounded-[32px] max-w-sm w-full text-center shadow-xl">
          <span className="material-symbols-outlined text-5xl text-primary mb-4">admin_panel_settings</span>
          <h2 className="text-2xl font-bold mb-6 text-on-surface">Admin Access</h2>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full bg-surface-container-highest px-4 py-3 rounded-xl mb-4 outline-none border border-transparent focus:border-primary-container"
          />
          <button type="submit" className="w-full gold-gradient-btn text-white py-3 rounded-xl font-semibold uppercase tracking-widest text-sm">
            Login
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface-container p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-cursive text-primary-container drop-shadow-sm">Guest List Manager</h1>
            <p className="text-sm font-label uppercase tracking-widest text-outline mt-2">
              Total Registered: {attendees.length}
            </p>
          </div>
          <button 
            onClick={fetchAttendees}
            className="flex items-center gap-2 bg-surface hover:bg-surface-variant text-on-surface px-4 py-2 rounded-full shadow-sm text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Refresh List
          </button>
        </div>

        <div className="glass-card rounded-[32px] shadow-lg overflow-hidden border border-outline-variant/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 text-on-surface-variant text-xs uppercase tracking-widest font-semibold border-b border-outline-variant/30">
                  <th className="px-6 py-4">Guest Name</th>
                  <th className="px-6 py-4">Relation</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4 min-w-[200px]">Plus-one &amp; notes</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      <div className="w-8 h-8 border-4 border-primary-container border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      Loading guests...
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant font-medium">
                      No guests have RSVP'd yet!
                    </td>
                  </tr>
                ) : (
                  attendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b border-outline-variant/20 hover:bg-surface/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface">{attendee.full_name}</div>
                        <div className="text-[10px] text-outline font-mono mt-1">ID: {attendee.id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full text-xs font-medium">
                          {attendee.relation}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {attendee.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant max-w-xs">
                        <span className="whitespace-pre-wrap leading-relaxed block">
                          {attendee.notes?.trim() ? attendee.notes : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-outline">
                        {new Date(attendee.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleBan(attendee.id, attendee.full_name)}
                          className="text-error hover:bg-error-container hover:text-on-error-container p-2 rounded-full transition-colors inline-flex"
                          title="Ban / Remove Guest"
                        >
                          <span className="material-symbols-outlined">person_remove</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
