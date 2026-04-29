import React from 'react';
import { ResizableCriteriaWindow } from '../ui/ResizableCriteriaWindow';

interface WindowState { x: number; y: number; width: number; height: number; isMinimized: boolean; isMaximized: boolean; zIndex: number; }
interface Props {
  title: string;
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (patch: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const DataNotProvidedWindow: React.FC<Props> = ({ title, windowState, onClose, onUpdateState, onFocus }) => {
  return (
    <ResizableCriteriaWindow
      title={title}
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      initialWidth={300}
      initialHeight={150}
    >
      <div className="flex-1 p-4 bg-white flex items-center justify-center">
        <span className="text-[12px] text-gray-500 font-medium">data not provided</span>
      </div>
    </ResizableCriteriaWindow>
  );
};
