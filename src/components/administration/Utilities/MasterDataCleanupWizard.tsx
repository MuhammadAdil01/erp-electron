import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';

interface MasterDataCleanupWizardProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[80px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const MasterDataCleanupWizard: React.FC<MasterDataCleanupWizardProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="Master Data Cleanup Wizard"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={600}
      minHeight={400}
      footer={
        <div className="h-[40px] px-3 bg-[#f0f0f0] border-t border-gray-300 flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
          <button className={`${sapGreyButtonStyle} opacity-50 cursor-not-allowed`} disabled>Back</button>
          <button className={sapButtonStyle}>Next</button>
        </div>
      }
    >
      <div className="flex-1 bg-white flex overflow-hidden">
        {/* Left Sidebar Gradient */}
        <div className="w-[100px] bg-gradient-to-b from-gray-200 via-white to-gray-200 border-r border-gray-300 shadow-inner" />
        
        {/* Main Content */}
        <div className="flex-1 p-8 flex flex-col gap-6">
          <h1 className="text-[14px] font-bold text-orange-600 underline underline-offset-4 decoration-gray-300">
            Introduction to Master Data Cleanup
          </h1>
          
          <div className="space-y-6 max-w-[500px]">
            <p className="text-[11px] leading-relaxed text-gray-800 font-bold">
              The master data cleanup wizard allows you to remove or deactivate business partners, item master data, G/L accounts, project codes, cost centers, distribution rules and tax codes.
            </p>
            
            <p className="text-[11px] leading-relaxed text-gray-800">
              The wizard guides you step by step through the process.
            </p>
            
            <p className="text-[11px] leading-relaxed text-gray-800 font-bold">
              WARNING: Removing data is irreversible
            </p>
          </div>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
