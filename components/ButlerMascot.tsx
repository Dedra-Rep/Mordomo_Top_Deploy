
import React, { useState, useEffect } from 'react';
import { MascotState, UserRole } from '../types';
import { COLORS } from '../constants';

interface ButlerMascotProps {
  state: MascotState;
  role: UserRole;
  emotion?: string;
  isMuted: boolean;
  onStop: () => void;
  onMuteToggle: () => void;
  onDismiss: () => void;
  isVisible?: boolean;
  onOpen: () => void;
}

export const ButlerMascot: React.FC<ButlerMascotProps> = ({ 
  state, 
  role, 
  emotion = 'neutral',
  isMuted, 
  onStop, 
  onMuteToggle, 
  onDismiss,
  isVisible = true,
  onOpen
}) => {
  const [mouthOpenAmount, setMouthOpenAmount] = useState(0);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  const theme = COLORS[role];
  const branding = role === UserRole.CUSTOMER ? "MORDOMO.AI" : "MORDOMO.TOP";

  useEffect(() => {
    let interval: number;
    if (state === MascotState.SPEAKING) {
      interval = window.setInterval(() => {
        setMouthOpenAmount(Math.random() * 8 + 2);
      }, 80);
    } else {
      setMouthOpenAmount(0);
    }
    return () => clearInterval(interval);
  }, [state]);

  useEffect(() => {
    const moveEyes = () => {
      if (state === MascotState.IDLE) {
        setPupilPos({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2 });
      } else {
        setPupilPos({ x: 0, y: -2 });
      }
    };
    const blink = () => { setIsBlinking(true); setTimeout(() => setIsBlinking(false), 150); };
    const eyeInt = setInterval(moveEyes, 3000);
    const blinkInt = setInterval(blink, 5000);
    return () => { clearInterval(eyeInt); clearInterval(blinkInt); };
  }, [state]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-8 left-8 z-[500]">
        <button 
          onClick={onOpen}
          className="w-16 h-16 bg-amber-500 text-slate-900 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)] animate-bounce flex items-center justify-center hover:scale-110 transition-transform border-4 border-slate-900"
          title="Call Butler"
        >
          <i className="fas fa-bell text-2xl"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-32 left-8 md:bottom-32 md:left-12 z-[500] pointer-events-none transition-all duration-700 ease-out animate-in slide-in-from-left-20">
      <div className="relative group pointer-events-auto flex flex-col items-center">
        {/* Status Tooltip */}
        <div className="mb-3 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          <div className={`w-2 h-2 rounded-full ${state !== MascotState.IDLE ? 'animate-pulse' : ''}`} style={{ backgroundColor: state === MascotState.SPEAKING ? '#10B981' : state === MascotState.THINKING ? '#F59E0B' : '#64748b' }}></div>
          <span className="text-[10px] font-black uppercase text-white tracking-widest">{state}</span>
        </div>

        {/* Avatar Container */}
        <div className={`w-28 h-36 md:w-40 md:h-52 relative transition-all duration-500 ${state === MascotState.LISTENING ? 'scale-110' : 'scale-100'}`}>
          <svg viewBox="0 0 120 150" className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: theme.butlerSuit }} />
                <stop offset="100%" style={{ stopColor: '#020617' }} />
              </linearGradient>
            </defs>
            
            {/* Body/Suit */}
            <path d="M 15 140 Q 15 100 60 100 Q 105 100 105 140 L 105 150 L 15 150 Z" fill="url(#suitGrad)" />
            <path d="M 45 100 L 60 115 L 75 100 L 60 105 Z" fill="#F8FAFC" />
            <rect x="57" y="112" width="6" height="10" rx="1" fill={theme.tie} />
            
            {/* Head */}
            <path d="M 30 40 Q 30 20 60 20 Q 90 20 90 40 L 90 85 Q 90 105 60 105 Q 30 105 30 85 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="4" />
            
            {/* Eyes and Brows */}
            <g transform={`translate(${pupilPos.x}, ${pupilPos.y})`}>
              <circle cx="45" cy="65" r="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
              <circle cx="45" cy="65" r="6" fill="#1E293B" style={{ display: isBlinking ? 'none' : 'block' }} />
              <circle cx="75" cy="65" r="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
              <circle cx="75" cy="65" r="6" fill="#1E293B" style={{ display: isBlinking ? 'none' : 'block' }} />
            </g>

            {/* Dynamic Mouth */}
            <path d={`M 45 92 Q 60 ${92 + mouthOpenAmount} 75 92`} fill="none" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" />
          </svg>

          {/* Brand Badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-[8px] font-black px-3 py-1 rounded-full border-2 border-slate-900 uppercase tracking-tighter italic whitespace-nowrap shadow-xl">
            {branding}
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute -right-14 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <button onClick={onMuteToggle} className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-2xl transition-all ${isMuted ? 'bg-red-500 text-white border-red-400 pointer-events-auto' : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white hover:border-white/30 pointer-events-auto'}`}>
            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-sm`}></i>
          </button>
          {state === MascotState.SPEAKING && (
            <button onClick={onStop} className="w-10 h-10 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 border-2 border-slate-900 transition-transform pointer-events-auto">
              <i className="fas fa-stop text-sm"></i>
            </button>
          )}
          <button onClick={onDismiss} className="w-10 h-10 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center border-2 border-white/5 hover:text-red-400 hover:border-red-400/30 transition-all pointer-events-auto">
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
