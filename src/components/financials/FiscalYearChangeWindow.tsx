import React, { useState, useRef, useEffect } from 'react';
import { FixedAssetWindowShell, GoldBtn } from './FixedAssetShared';
import { ChevronDown } from 'lucide-react';

interface WS { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WS; onClose:()=>void; onUpdateState:(s:Partial<WS>)=>void; onFocus:()=>void; }

const YEARS = Array.from({length:15}, (_,i) => 2016+i);

const yearToRange = (y: number) => {
  const s = `01.07.${String(y-1).slice(-2)} - 30.06.${String(y).slice(-2)}`;
  return s;
};

export const FiscalYearChangeWindow: React.FC<Props> = (props) => {
  const [fromYear, setFromYear] = useState(2026);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const toYear = fromYear + 1;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  return (
    <FixedAssetWindowShell title="Fiscal Year Change" {...props} minWidth={420} minHeight={180}>
      <div className="px-5 py-4 flex flex-col gap-3 flex-1">
        {/* From Fiscal Year */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#333] w-32 shrink-0">From Fiscal Year</span>
          <div className="relative" ref={dropRef}>
            <div
              onClick={()=>setShowDropdown(v=>!v)}
              className="flex items-center border border-gray-400 bg-[#fffae6] h-5 shadow-inner cursor-pointer"
            >
              <span className="text-[10.5px] px-2 w-16 text-center">{fromYear}</span>
              <div className="border-l border-gray-400 h-full flex items-center px-0.5 hover:bg-yellow-100">
                <ChevronDown className="w-3 h-3 text-gray-600"/>
              </div>
            </div>
            {showDropdown && (
              <div className="absolute left-0 top-full z-50 bg-white border border-gray-400 shadow-lg max-h-52 overflow-y-auto">
                {YEARS.map(y=>(
                  <div
                    key={y}
                    onClick={()=>{ setFromYear(y); setShowDropdown(false); }}
                    className={`px-3 py-0.5 text-[11px] cursor-pointer hover:bg-blue-100
                      ${y===fromYear ? 'bg-[#ffed99] font-bold' : ''}`}
                  >{y}</div>
                ))}
              </div>
            )}
          </div>
          <span className="text-[11px] text-[#666]">{yearToRange(fromYear)}</span>
        </div>

        {/* To Fiscal Year */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#333] w-32 shrink-0">To Fiscal Year</span>
          <div className="flex items-center border border-gray-400 bg-[#e0e0e0] h-5 shadow-inner">
            <span className="text-[10.5px] px-2 w-16 text-center text-gray-700">{toYear}</span>
            <div className="border-l border-gray-400 h-full flex items-center px-0.5 bg-[#d8d8d8]">
              <ChevronDown className="w-3 h-3 text-gray-400"/>
            </div>
          </div>
          <span className="text-[11px] text-[#666]">{yearToRange(toYear)}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1"/>

        {/* Buttons */}
        <div className="flex gap-2">
          <GoldBtn>Execute</GoldBtn>
          <GoldBtn onClick={props.onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
