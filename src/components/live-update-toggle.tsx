'use client';

interface LiveUpdateToggleProps {
  isLive: boolean;
  onToggle: (val: boolean) => void;
}

export function LiveUpdateToggle({ isLive, onToggle }: LiveUpdateToggleProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/5 rounded-2xl">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Live Sync</span>
        <span className={`text-[8px] font-bold ${isLive ? 'text-[#00D4AA]' : 'text-[#666680]'} uppercase`}>
          {isLive ? 'Active' : 'Standby'}
        </span>
      </div>
      
      <button 
        onClick={() => onToggle(!isLive)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isLive ? 'bg-[#00D4AA]' : 'bg-white/10'}`}
      >
        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${isLive ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
