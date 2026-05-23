import React from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';

interface LicenseInformationWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const LicenseInformationWindow: React.FC<LicenseInformationWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  return (
    <ResizableCriteriaWindow
      title="License Information"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={500}
      minHeight={400}
    >
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        
        {/* Top Image Placeholder */}
        <div className="w-full h-[200px] bg-gray-100 flex items-center justify-center border-b border-gray-200">
           <img 
             src="/license_info_banner.png" 
             alt="License Information Header"
             className="w-full h-full object-cover"
           />
        </div>

        {/* Content Area */}
        <div className="p-8 flex flex-col gap-6 select-text">
           
           <div className="flex flex-col gap-1">
              <h2 className="text-[18px] text-[#333] leading-tight">
                 Attention, If your company has not licensed 
                 <span className="inline-block w-24"></span> 
                 you are not authorized to use this
              </h2>
           </div>

           <div className="flex flex-col gap-4">
              <p className="text-[12px] text-[#555] leading-relaxed">
                 "Test system" and "Development system" cannot be used for productive use. If you have questions about your license, please contact your SAP partner. 
              </p>
              <p className="text-[12px] text-[#555] leading-relaxed">
                 Please note that use of the software without the relevant license rights represents a copyright infringement and that SAP reserves the right to take legal action in order to protect its interests.
              </p>
           </div>

        </div>

        {/* SAP Style Bottom Border */}
        <div className="mt-auto h-[4px] bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 shadow-sm" />
      </div>
    </ResizableCriteriaWindow>
  );
};
