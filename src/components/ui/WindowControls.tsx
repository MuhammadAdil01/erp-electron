import React from 'react';

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const WindowControls: React.FC<WindowControlsProps> = ({ onMinimize, onMaximize, onClose }) => {
  return (
    <div className="flex items-center gap-[2px] h-full py-[3px]" onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
      <button 
        onClick={onMinimize}
        className="w-[26px] h-full bg-[#f0f0f0] border border-black/60 flex items-center justify-center hover:bg-white active:bg-gray-400 transition-colors rounded-sm"
      >
        <div className="w-2.5 h-[1.5px] bg-black mt-2.5" />
      </button>
      <button 
        onClick={onMaximize}
        className="w-[26px] h-full bg-[#f0f0f0] border border-black/60 flex items-center justify-center hover:bg-white active:bg-gray-400 transition-colors rounded-sm"
      >
        <div className="w-2.5 h-2 border-[1.5px] border-black border-t-[2.5px]" />
      </button>
      <button 
        onClick={onClose}
        className="w-[42px] h-full bg-[#f0f0f0] border border-black/60 flex items-center justify-center hover:bg-[#e81123] hover:text-white active:bg-[#ac101d] transition-colors rounded-sm group/close"
      >
        <span className="text-[16px] leading-none mb-1 font-light group-hover/close:font-normal">×</span>
      </button>
    </div>
  );
};
