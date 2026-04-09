"use client";

import { useEffect, useState } from "react";
import RSVPModal from "@/components/RSVPModal";

function Countdown() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const targetDate = new Date("2026-04-25T13:00:00+03:00").getTime();

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) { clearInterval(interval); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const days = mounted ? timeLeft.days.toString().padStart(2, "0") : "00";
  const hours = mounted ? timeLeft.hours.toString().padStart(2, "0") : "00";
  const mins = mounted ? timeLeft.minutes.toString().padStart(2, "0") : "00";
  const secs = mounted ? timeLeft.seconds.toString().padStart(2, "0") : "00";

  return (
    <div className="grid grid-cols-4 gap-3 md:gap-8 max-w-3xl mx-auto">
      <div className="glass-card p-4 md:p-8 rounded-3xl flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform">
        <span className="text-3xl md:text-5xl font-notoSerif text-primary">{days}</span>
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant mt-1 md:mt-2">Days</span>
      </div>
      <div className="glass-card p-4 md:p-8 rounded-3xl flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform">
        <span className="text-3xl md:text-5xl font-notoSerif text-primary">{hours}</span>
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant mt-1 md:mt-2">Hours</span>
      </div>
      <div className="glass-card p-4 md:p-8 rounded-3xl flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform">
        <span className="text-3xl md:text-5xl font-notoSerif text-primary">{mins}</span>
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant mt-1 md:mt-2">Mins</span>
      </div>
      <div className="glass-card p-4 md:p-8 rounded-3xl flex flex-col items-center justify-center shadow-sm hover:scale-[1.02] transition-transform">
        <span className="text-3xl md:text-5xl font-notoSerif text-primary">{secs}</span>
        <span className="text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant mt-1 md:mt-2">Secs</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [isRSVPModalOpen, setRSVPModalOpen] = useState(false);
  const [ticket, setTicket] = useState<{id: string, qrUrl: string} | null>(null);

  return (
    <main className="overflow-x-hidden pb-12 selection:bg-primary-fixed selection:text-on-primary-fixed-variant">
      
      {/* 1. Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-end">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Fish and Hanni Portrait" 
            className="w-full h-full object-cover block md:hidden landscape:hidden" 
            src="/hero-portrait.webp"
          />
          <img 
            alt="Fish and Hanni Landscape" 
            className="w-full h-full object-cover hidden md:block landscape:block" 
            src="/hero-landscape.png"
          />
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="relative z-10 text-center space-y-4 pb-6 px-6">
          <span className="text-on-surface/90 font-label tracking-[0.3em] uppercase text-xs">You're Invited</span>
          <h1 className="text-6xl md:text-8xl font-cursive text-primary-container drop-shadow-lg">Fish &amp; Hanni</h1>
          <p className="text-on-surface-variant font-notoSerif italic text-xl">The Union of Two Souls</p>
        </div>
      </section>

      {/* 1.5 Invitation Message Section */}
      <section className="min-h-screen bg-surface text-center flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <span className="material-symbols-outlined text-primary-container text-7xl md:text-8xl mb-4 opacity-90">menu_book</span>
          
          <p className="font-benaiah text-primary text-sm md:text-base leading-relaxed mb-4 max-w-xl italic">
            "ኹሎ ዘፈቀደ ገብረ እግዚአብሔር በሰማይኒ ወበምድርኒ በባህርኒ ወበኩሉ ቀላያት"<br/>
            <span className="text-xs mt-1 block font-notoSerif text-outline tracking-wider">— መዝሙር 134:6 —</span>
          </p>

          {/* Ornamental Divider */}
          <div className="flex items-center gap-3 w-full max-w-sm mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-container to-primary/40"></div>
            <span className="text-primary-container text-lg select-none">✿</span>
            <span className="text-primary text-2xl select-none font-cursive opacity-70">❧</span>
            <span className="text-primary-container text-lg select-none">✿</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary-container to-primary/40"></div>
          </div>
          
          <div className="space-y-3 font-benaiah leading-normal text-on-surface text-base md:text-lg w-full">
            <p className="opacity-90">የማክበር ሰላምታችንን እያቀረብን የልጃችን</p>
            
            <div className="text-2xl md:text-3xl font-bold text-primary-container flex flex-col items-center gap-1 py-2">
              <span>የካፕቴን ፍስሐ ተሾመ</span>
              <span className="text-sm font-normal text-outline/80">እና</span>
              <span>የወ/ሪት ሀና ሰሎሞን</span>
            </div>
            
            <p className="leading-relaxed max-w-xl mx-auto opacity-90">
              የጋብቻ ስነስርዓት የሚፈፀመው ቅዳሜ ሚያዚያ 17 2018 ዓ.ም በመሆኑ 
              በገርጂ ማርያም አዳራሽ በምናደርገው የምሳ ግብዣ <span className="font-semibold text-primary">6:00</span> ላይ እንዲገኙልን ስንል በማክበር ጠርተኖታል።
            </p>
            
            <div className="pt-3">
              <p className="text-xs text-outline-variant font-label tracking-widest mb-0.5">ጠሪ አክባሪዎ</p>
              <p className="text-lg md:text-xl font-semibold text-primary">ቤተሰቦቻቸው</p>
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/30 w-3/4 mx-auto">
              <p className="text-xs text-outline-variant font-label tracking-widest mb-0.5">አድራሻ</p>
              <p className="text-base md:text-lg font-semibold text-primary">ገርጂ ማርያም ቤተክርስቲያን አዳራሽ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Countdown Section */}
      <section className="px-6 py-16 md:py-28 bg-surface-container-low">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-sm md:text-base font-label tracking-[0.2em] uppercase text-outline mb-10 md:mb-16">Counting Down To Forever</h2>
          <Countdown />
        </div>
      </section>

      {/* Wrapping Calendar and Map in a side-by-side Grid on Desktop */}
      <div className="bg-surface-container md:bg-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-16 lg:gap-24 md:px-12 md:py-24">
          
          {/* 3. Event Date Calendar */}
          <section className="px-6 py-20 md:py-0 relative overflow-hidden bg-surface-container md:bg-transparent">
            <div className="max-w-sm mx-auto md:max-w-full">
                <div className="text-center md:text-left mb-6">
                  <h2 className="text-4xl md:text-5xl font-notoSerif text-on-surface mb-1 md:mb-2">April 25</h2>
                  <p className="text-primary font-label tracking-widest uppercase text-xs md:text-sm">Twenty Twenty-Six</p>
                  <p className="text-primary font-benaiah text-xs mt-1 opacity-80">ሚያዚያ 17፣ 2018 ዓ.ም</p>
                </div>
              <div className="glass-card p-8 md:p-10 rounded-[40px] shadow-sm md:shadow-md relative overflow-hidden">
                <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-xs font-label items-center">
                  <div className="text-outline/50 pb-1">S</div><div className="text-outline/50 pb-1">M</div><div className="text-outline/50 pb-1">T</div><div className="text-outline/50 pb-1">W</div><div className="text-outline/50 pb-1">T</div><div className="text-outline/50 pb-1">F</div><div className="text-outline/50 pb-1">S</div>

                  {/* Week 1: Mar 29–Apr 4 | ET: Meg 21–23, Miy 23-26 */}
                  <div className="text-outline/20 flex flex-col"><span>29</span><span className="text-[8px] text-outline/30">21</span></div>
                  <div className="text-outline/20 flex flex-col"><span>30</span><span className="text-[8px] text-outline/30">22</span></div>
                  <div className="text-outline/20 flex flex-col"><span>31</span><span className="text-[8px] text-outline/30">23</span></div>
                  <div className="text-on-surface flex flex-col"><span>1</span><span className="text-[8px] text-outline/50">23</span></div>
                  <div className="text-on-surface flex flex-col"><span>2</span><span className="text-[8px] text-outline/50">24</span></div>
                  <div className="text-on-surface flex flex-col"><span>3</span><span className="text-[8px] text-outline/50">25</span></div>
                  <div className="text-on-surface flex flex-col"><span>4</span><span className="text-[8px] text-outline/50">26</span></div>

                  {/* Week 2: Apr 5–11 | ET: Meg 27–30, Miy 1–3 */}
                  <div className="text-on-surface flex flex-col"><span>5</span><span className="text-[8px] text-outline/50">27</span></div>
                  <div className="text-on-surface flex flex-col"><span>6</span><span className="text-[8px] text-outline/50">28</span></div>
                  <div className="text-on-surface flex flex-col"><span>7</span><span className="text-[8px] text-outline/50">29</span></div>
                  <div className="text-on-surface flex flex-col"><span>8</span><span className="text-[8px] text-outline/50">30</span></div>
                  <div className="text-on-surface flex flex-col"><span>9</span><span className="text-[8px] text-primary/50">1</span></div>
                  <div className="text-on-surface flex flex-col"><span>10</span><span className="text-[8px] text-primary/50">2</span></div>
                  <div className="text-on-surface flex flex-col"><span>11</span><span className="text-[8px] text-primary/50">3</span></div>

                  {/* Week 3: Apr 12–18 | ET: Miy 4–10 */}
                  <div className="text-on-surface flex flex-col"><span>12</span><span className="text-[8px] text-primary/50">4</span></div>
                  <div className="text-on-surface flex flex-col"><span>13</span><span className="text-[8px] text-primary/50">5</span></div>
                  <div className="text-on-surface flex flex-col"><span>14</span><span className="text-[8px] text-primary/50">6</span></div>
                  <div className="text-on-surface flex flex-col"><span>15</span><span className="text-[8px] text-primary/50">7</span></div>
                  <div className="text-on-surface flex flex-col"><span>16</span><span className="text-[8px] text-primary/50">8</span></div>
                  <div className="text-on-surface flex flex-col"><span>17</span><span className="text-[8px] text-primary/50">9</span></div>
                  <div className="text-on-surface flex flex-col"><span>18</span><span className="text-[8px] text-primary/50">10</span></div>

                  {/* Week 4: Apr 19–25 | ET: Miy 11–17 ⭐ */}
                  <div className="text-on-surface flex flex-col"><span>19</span><span className="text-[8px] text-primary/50">11</span></div>
                  <div className="text-on-surface flex flex-col"><span>20</span><span className="text-[8px] text-primary/50">12</span></div>
                  <div className="text-on-surface flex flex-col"><span>21</span><span className="text-[8px] text-primary/50">13</span></div>
                  <div className="text-on-surface flex flex-col"><span>22</span><span className="text-[8px] text-primary/50">14</span></div>
                  <div className="text-on-surface flex flex-col"><span>23</span><span className="text-[8px] text-primary/50">15</span></div>
                  <div className="text-on-surface flex flex-col"><span>24</span><span className="text-[8px] text-primary/50">16</span></div>
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-primary-container/20 rounded-lg scale-110"></div>
                    <span className="relative font-bold text-primary text-sm">25</span>
                    <span className="relative text-[8px] font-bold text-primary">17</span>
                  </div>

                  {/* Week 5: Apr 26–May 2 | ET: Miy 18–24 */}
                  <div className="text-on-surface flex flex-col"><span>26</span><span className="text-[8px] text-primary/50">18</span></div>
                  <div className="text-on-surface flex flex-col"><span>27</span><span className="text-[8px] text-primary/50">19</span></div>
                  <div className="text-on-surface flex flex-col"><span>28</span><span className="text-[8px] text-primary/50">20</span></div>
                  <div className="text-on-surface flex flex-col"><span>29</span><span className="text-[8px] text-primary/50">21</span></div>
                  <div className="text-on-surface flex flex-col"><span>30</span><span className="text-[8px] text-primary/50">22</span></div>
                  <div className="text-outline/20 flex flex-col"><span>1</span><span className="text-[8px] text-outline/30">23</span></div>
                  <div className="text-outline/20 flex flex-col"><span>2</span><span className="text-[8px] text-outline/30">24</span></div>
                </div>
                <div className="mt-10 pt-10 border-t border-outline-variant/20 space-y-6">
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-primary-container">schedule</span>
                    <div>
                      <p className="text-sm font-semibold">The Ceremony & Lunch</p>
                      <p className="text-xs text-on-surface-variant mt-1">Starts at 1:00 PM (Local Time)</p>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </section>

          {/* 4. Live Map Section */}
          <section className="px-6 py-16 md:py-0 bg-surface-container md:bg-transparent flex flex-col justify-center">
            <div className="max-w-md mx-auto md:max-w-full w-full">
              <div className="mb-8 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="w-14 h-14 bg-primary-container/30 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-notoSerif mb-2 leading-snug">Gerji St. Mariam Church<br/><span className="text-lg md:text-xl text-primary font-benaiah drop-shadow-sm">ገርጂ ቅድስት ማርያም ቤተክርስቲያን</span></h2>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed">XRX2+JQW, Addis Ababa, Ethiopia</p>
              </div>
              
              <div className="flex flex-col gap-6">
                {/* Standard Map Embed Container */}
                <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[32px] overflow-hidden shadow-lg border border-outline-variant/20">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.7066197303884!2d38.799368174780206!3d8.999120191061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f3a6aa0aaf%3A0x4c69dfae97e0b50a!2zR2VyamkgU3QuIE1hcmlhbSBDaHVyY2ggfCDhjIjhiK3hjIIg4YmF4Yu14Yi14Ym1IOGIm-GIreGLq-GInSDhiaThibDhiq3hiK3hiLXhibLhi6vhipU!5e0!3m2!1sen!2set!4v1775735774356!5m2!1sen!2set"
                    className="w-full h-full border-0 absolute inset-0 bg-surface" 
                    allowFullScreen
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Wedding Location Map"
                  />
                </div>
                
                {/* Standalone Directions CTA */}
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=Gerji+Mebrathail+Maryam+Orthodox+Church,+Addis+Ababa" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-white hover:bg-surface-container-low border border-outline-variant/30 text-on-surface py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                    <span className="font-semibold text-sm">Get Directions</span>
                    <span className="material-symbols-outlined text-primary">navigation</span>
                </a>
              </div>

            </div>
          </section>
          
        </div>
      </div>

      {/* 5. Gallery & Telegram CTA */}
      <section className="py-20 md:py-32 bg-surface overflow-hidden">
        <div className="max-w-md md:max-w-3xl mx-auto text-center px-6 mb-12 md:mb-20">
          <h2 className="text-4xl md:text-6xl font-cursive text-primary-container drop-shadow-sm mb-4 md:mb-8">Share Your Moments</h2>
          <p className="text-on-surface-variant text-sm md:text-lg lg:px-20 leading-relaxed md:leading-loose">
            Help us capture the magic. Take a look at these captured memories and send us the photos you take during the celebration.
          </p>
        </div>

        {/* Auto Scrolling Gallery */}
        <div className="relative w-full flex overflow-hidden mb-16">
          <div className="flex w-max animate-scroll">
            {/* First Set */}
            {[
              "/gallery1.webp",
              "/gallery2.webp",
              "/gallery3.webp",
              "/gallery1.webp",
              "/gallery2.webp",
              "/gallery3.webp",
            ].map((src, i) => (
              <div key={i} className="w-56 h-72 md:w-80 md:h-[400px] flex-shrink-0 mx-2 md:mx-4 rounded-[32px] overflow-hidden shadow-lg border border-outline-variant/30 transition-transform duration-500 hover:scale-[1.03]">
                <img src={src} alt="Captured Moment" className="w-full h-full object-cover" />
              </div>
            ))}
            {/* Duplicated Set for Seamless Loop */}
            {[
              "/gallery1.webp",
              "/gallery2.webp",
              "/gallery3.webp",
              "/gallery1.webp",
              "/gallery2.webp",
              "/gallery3.webp",
            ].map((src, i) => (
              <div key={`dup-${i}`} className="w-56 h-72 md:w-80 md:h-[400px] flex-shrink-0 mx-2 md:mx-4 rounded-[32px] overflow-hidden shadow-lg border border-outline-variant/30 transition-transform duration-500 hover:scale-[1.03]">
                <img src={src} alt="Captured Moment" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {/* Edge Gradients for Smoothness */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-48 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
        </div>

        {/* Telegram Share Button */}
        <div className="max-w-md md:max-w-full mx-auto text-center px-6">
          <a href="https://t.me/fish_and_hanni_wedding_bot" target="_blank" rel="noreferrer" className="gold-gradient-btn text-white py-4 md:py-5 px-8 md:px-12 rounded-full text-xs md:text-sm font-label uppercase tracking-widest inline-flex items-center justify-center gap-3 transition-all hover:scale-[1.05] shadow-lg">
              <span className="material-symbols-outlined text-lg md:text-xl">send</span>
              Share us on Telegram
          </a>
        </div>
      </section>

      {/* 6. RSVP & QR Code Section */}
      <section className="px-6 py-20 md:py-32 flex flex-col items-center">
        {!ticket ? (
          <div className="glass-card p-10 md:p-16 rounded-[48px] shadow-sm md:shadow-lg flex flex-col items-center max-w-sm md:max-w-md w-full text-center transition-all duration-700">
            <span className="material-symbols-outlined text-5xl text-primary-container mb-6">workspace_premium</span>
            <h2 className="text-3xl md:text-3xl font-cursive text-primary mb-4 leading-tight">Your Digital Pass</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-8">
                <p className="text-sm md:text-sm font-notoSerif italic text-on-surface-variant font-medium">
                  We are organizing dedicated seats, food, and drinks for everyone. You <strong className="text-primary font-bold">must</strong> register below to generate your unique Entrance Ticket for the gate!
                </p>
            </div>
            <button 
              onClick={() => setRSVPModalOpen(true)}
              className="w-full gold-gradient-btn text-white py-5 px-8 flex items-center justify-center gap-3 transition-transform hover:scale-[1.03] rounded-full text-sm font-label uppercase tracking-widest shadow-[0_4px_25px_rgba(202,152,73,0.4)] animate-pulse"
            >
              <span className="material-symbols-outlined">confirmation_number</span>
              Get My Ticket Now
            </button>
          </div>
        ) : (
          <div className="glass-card p-10 md:p-16 rounded-[48px] shadow-sm md:shadow-lg flex flex-col items-center max-w-xs md:max-w-md w-full text-center hover:scale-[1.02] transition-transform duration-700 animate-in fade-in zoom-in">
            <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-label uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified</span>
              Registration Confirmed
            </div>
            
            <div className="qr-metallic p-6 rounded-[32px] mb-8 relative">
              <div className="bg-white p-2 rounded-[16px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]">
                  <img src={ticket.qrUrl} alt="Your Unique Entrance Pass" className="w-40 h-40 mix-blend-multiply" />
              </div>
            </div>
            
            <p className="text-xs font-label text-outline uppercase tracking-widest mb-2">Ticket ID</p>
            <p className="text-[10px] font-mono text-on-surface-variant bg-surface-variant/50 px-3 py-1.5 rounded-lg select-all">
              {ticket.id}
            </p>
            <p className="text-sm font-notoSerif italic text-on-surface-variant mt-6">
              Please present this QR code at the entrance.
            </p>
          </div>
        )}
      </section>

      <RSVPModal 
        isOpen={isRSVPModalOpen}
        onClose={() => setRSVPModalOpen(false)}
        onSuccess={(data) => {
          setTicket(data);
          // Optional: Scroll to the ticket 
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }}
      />
    </main>
  );
}
