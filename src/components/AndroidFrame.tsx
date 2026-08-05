import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, ArrowLeft, RefreshCw, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isFullscreen: boolean;
  setIsFullscreen: (val: boolean) => void;
  onRefresh: () => void;
}

export default function AndroidFrame({ children, isFullscreen, setIsFullscreen, onRefresh }: AndroidFrameProps) {
  const [time, setTime] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(88);

  useEffect(() => {
    // Continuous native clock
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, "0");
      let minutes = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Battery simulator
    const interval = setInterval(() => {
      setBatteryLevel((prev) => (prev > 5 ? prev - 1 : 100));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isFullscreen) {
    return (
      <div className="w-full min-h-screen bg-[#0d0e12] text-gray-100 flex flex-col">
        {/* Fullscreen header control */}
        <div className="bg-[#14161f] border-b border-gray-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
              DL
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white">AnDownloader AI Pro</h1>
              <p className="text-xs text-gray-400">Mode Layar Penuh Aktif</p>
            </div>
          </div>
          <button 
            id="btn-toggle-frame"
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/40 rounded-xl text-sm font-medium border border-indigo-500/20 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Ganti ke Mode Android HP</span>
          </button>
        </div>
        
        {/* Full viewport contents */}
        <div id="fullscreen-app" className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Dynamic atmospheric ambient glow behind the smartphone mockup */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-pink-500/5 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Control bar above the phone */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between px-2 text-gray-400 text-sm z-10">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span className="font-medium text-gray-300">Android Mockup Active</span>
        </div>
        <button
          id="btn-fullscreen"
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs rounded-lg border border-gray-700 cursor-pointer transition"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Layar Penuh</span>
        </button>
      </div>

      {/* Actual Physical Smartphone Container */}
      <div className="w-full max-w-[420px] aspect-[9/19.5] bg-[#07080a] p-[10px] rounded-[52px] border-[4px] border-gray-800 android-screen-shadow flex flex-col relative overflow-hidden ring-4 ring-gray-900/40 z-10">
        
        {/* Side physical buttons */}
        <div className="absolute left-[-4px] top-32 w-[4px] h-[60px] bg-gray-700 rounded-l"></div>
        <div className="absolute right-[-4px] top-24 w-[4px] h-[40px] bg-gray-700 rounded-r"></div>
        <div className="absolute right-[-4px] top-38 w-[4px] h-[75px] bg-gray-700 rounded-r"></div>

        {/* Interior Phone Canvas */}
        <div className="flex-1 rounded-[42px] bg-[#0d0e12] overflow-hidden flex flex-col border border-gray-900 relative">
          
          {/* Top Status Bar Grid */}
          <div className="h-12 bg-[#0c0d11] px-6 flex items-center justify-between text-gray-400 text-xs font-semibold z-30 select-none">
            {/* Clock */}
            <span>{time}</span>
            
            {/* Center Punch Hole Camera Notch */}
            <div className="absolute left-1/2 -translate-x-1/2 top-3 w-6 h-6 bg-black rounded-full border border-gray-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-900/40 rounded-full"></div>
            </div>
            
            {/* Battery, Wifi, Signal Icons */}
            <div className="flex items-center gap-1.5">
              <Signal className="w-3.5 h-3.5 text-gray-300" />
              <Wifi className="w-3.5 h-3.5 text-gray-300" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-gray-400">{batteryLevel}%</span>
                <Battery className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
              </div>
            </div>
          </div>

          {/* Quick Mock Browser controls in Smartphone mode */}
          <div className="bg-[#111219] px-4 py-2 border-b border-gray-900 flex items-center justify-between text-xs text-gray-400">
            <span className="font-medium tracking-wide text-indigo-400">AnDownloader OS v14</span>
            <button 
              id="btn-refresh" 
              onClick={onRefresh} 
              className="p-1 hover:text-white transition cursor-pointer"
              title="Reset Aplikasi"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Inner Phone Content viewport */}
          <div className="flex-1 overflow-y-auto flex flex-col relative">
            {children}
          </div>

          {/* Android Navigation Pill Bar at bottom */}
          <div className="h-7 bg-[#0d0e12] flex items-center justify-center p-1.5 select-none z-30">
            <div className="w-32 h-1 bg-gray-500/80 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center max-w-sm text-xs text-gray-500 select-none">
        Mendukung konversi dan pengunduhan video, gulungan reels, video musik, dan konten audio dari berbagai platform media sosial langsung ke penyimpanan Anda.
      </div>
    </div>
  );
}
