import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';

interface AddOnIdentifierGeneratorWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const AddOnIdentifierGeneratorWindow: React.FC<AddOnIdentifierGeneratorWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [type, setType] = useState('Development');

  return (
    <ResizableCriteriaWindow
      title="Add-On Identifier Generator"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={400}
      minHeight={300}
    >
      <div className="flex-1 p-4 flex flex-col gap-6 bg-[#f0f0f0] overflow-hidden">
        
        {/* Section: Select Add-on Type */}
        <div className="flex flex-col gap-2">
           <span className={`${sapLabelStyle} font-bold underline`}>Select Add-on Type</span>
           <div className="flex flex-col gap-1 ml-1">
              {['Development', 'Implementation', 'Solution'].map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer group">
                   <input 
                     type="radio" 
                     name="addon-type" 
                     checked={type === t} 
                     onChange={() => setType(t)}
                     className="w-3.5 h-3.5"
                   />
                   <span className={`${sapLabelStyle} group-hover:text-blue-700`}>{t}</span>
                </label>
              ))}
           </div>
        </div>

        {/* Section: Add-On Identifier */}
        <div className="flex-1 flex flex-col gap-1">
           <span className={`${sapLabelStyle} font-bold underline`}>Add-On Identifier</span>
           <div className="flex-1 bg-[#e0e0e0] border border-gray-400 p-1 min-h-[60px] shadow-inner">
              <textarea 
                className="w-full h-full bg-transparent outline-none resize-none text-[11px] font-mono"
                readOnly
              />
           </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2">
           <button className={sapButtonStyle}>Generate</button>
           <button onClick={onClose} className={sapButtonStyle}>Cancel</button>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
