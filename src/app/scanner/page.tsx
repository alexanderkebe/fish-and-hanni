"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function ScannerPage() {
  const router = useRouter();
  const [scanning, setScanning] = useState(true);

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const text = detectedCodes[0].rawValue;
      if (text) {
        setScanning(false);
        try {
          // Check if the QR code is a URL
          const url = new URL(text);
          
          if (url.pathname === '/verify') {
            // It's a valid ticket link. Route locally to the verify page
            router.push(url.pathname + url.search);
          } else {
            // Not our verification link
            alert("Invalid QR Code: Not an official wedding ticket!");
            setTimeout(() => setScanning(true), 2500);
          }
        } catch {
          // If it isn't a URL
          alert("Invalid format: Fake ticket or unknown QR.");
          setTimeout(() => setScanning(true), 2500);
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-surface-container flex flex-col items-center justify-center p-6 pb-16">
      <div className="glass-card w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl p-6 text-center animate-in zoom-in duration-500 border border-white/50">
        <span className="material-symbols-outlined text-5xl text-primary mb-2">qr_code_scanner</span>
        <h1 className="text-3xl font-cursive text-primary-container mb-1">Gate Scanner</h1>
        <p className="text-xs font-label text-outline mb-6 uppercase tracking-widest">Hold Ticket QR code in frame</p>
        
        <div className="rounded-3xl overflow-hidden shadow-inner aspect-square w-full bg-black relative flex items-center justify-center border-4 border-surface-variant">
          {scanning ? (
            <Scanner 
              onScan={handleScan} 
              formats={['qr_code']}
              onError={(error) => console.log("Scanner minor error:", error?.message)}
            />
          ) : (
            <div className="text-primary-container animate-pulse flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl mb-3">hourglass_empty</span>
              <p className="font-label uppercase tracking-widest text-sm">Processing...</p>
            </div>
          )}
          
          {/* Viewfinder overlay */}
          {scanning && (
            <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-xl"></div>
                <div className="w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-xl"></div>
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-xl"></div>
                <div className="w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-xl"></div>
              </div>
            </div>
          )}
        </div>
        
        <p className="text-xs font-notoSerif text-on-surface-variant italic mt-6 opacity-80">
          Make sure the brightness on the guest's phone is turned up.
        </p>
      </div>
    </main>
  );
}
