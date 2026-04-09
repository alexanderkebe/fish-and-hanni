"use client";

import { useState, FormEvent } from "react";

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (attendeeData: { id: string; qrUrl: string }) => void;
}

export default function RSVPModal({ isOpen, onClose, onSuccess }: RSVPModalProps) {
  const [step, setStep] = useState<'form' | 'loading'>('form');
  const [formData, setFormData] = useState({ fullName: '', phone: '', relation: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.relation) {
      setError("Please fill out your name and relation to the couple.");
      return;
    }
    setError('');
    setStep('loading');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit RSVP');
      }

      const verifyUrl = `${window.location.origin}/verify?id=${data.attendee.id}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(verifyUrl)}&color=775a19&bgcolor=ffffff`;
      
      // Pass back to parent to render success state natively
      onSuccess({ id: data.attendee.id, qrUrl });
      onClose(); // close modal
      setStep('form'); // reset
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="glass-card p-6 md:p-10 rounded-[32px] w-full max-w-md shadow-2xl relative border border-outline-variant/30 bg-surface">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-variant transition-colors text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="mb-8 text-center mt-2">
          <h2 className="text-3xl font-cursive text-primary-container mb-2">RSVP</h2>
          <p className="text-sm font-label uppercase tracking-widest text-outline">Confirm Your Attendance</p>
        </div>

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-error-container text-on-error-container text-xs p-3 rounded-xl border border-error/20">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="E.g. Abel Tesfaye"
                className="w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Phone Number (Optional)</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+251 9..."
                className="w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5 ml-1">Relation to Couple</label>
              <select 
                value={formData.relation}
                onChange={e => setFormData({...formData, relation: e.target.value})}
                className="w-full bg-surface-container hover:bg-surface-container-high focus:bg-surface-container-high outline-none px-5 py-4 rounded-2xl text-on-surface transition-colors font-medium border-2 border-transparent focus:border-primary-container appearance-none"
              >
                <option value="" disabled>Select relation...</option>
                <option value="Bride's Family">Bride's Family</option>
                <option value="Bride's Friend">Bride's Friend</option>
                <option value="Groom's Family">Groom's Family</option>
                <option value="Groom's Friend">Groom's Friend</option>
                <option value="Mutual Friend">Mutual Friend</option>
                <option value="Coworker">Coworker</option>
              </select>
            </div>

            <button 
              type="submit"
              className="w-full gold-gradient-btn text-white font-semibold uppercase tracking-widest text-sm py-4 rounded-2xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 mt-2 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Confirm RSVP
            </button>
          </form>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-label uppercase tracking-widest text-primary animate-pulse">Generating Ticket...</p>
          </div>
        )}
      </div>
    </div>
  );
}
