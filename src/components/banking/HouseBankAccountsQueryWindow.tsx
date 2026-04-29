import React from 'react';
import { X, Minus, Square, Play, ChevronRight, BarChart3, ChevronDown } from 'lucide-react';
import { WindowControls } from '../ui/WindowControls';
import { ClassicTable, YellowBtn, cn } from '../ui/ClassicERPUI';

interface WindowState {
  x: number; y: number; width: number; height: number;
  isMinimized: boolean; isMaximized: boolean; zIndex: number;
}

interface HouseBankAccountsQueryWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

export const HouseBankAccountsQueryWindow: React.FC<HouseBankAccountsQueryWindowProps> = ({
  windowState, onClose, onUpdateState, onFocus
}) => {
  if (windowState.isMinimized) return null;

  const handleDrag = (e: React.MouseEvent) => {
    if (windowState.isMaximized) return;
    onFocus();
    const startX = e.clientX - windowState.x;
    const startY = e.clientY - windowState.y;
    const onMouseMove = (moveEvent: MouseEvent) => {
      onUpdateState({ x: moveEvent.clientX - startX, y: moveEvent.clientY - startY });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onFocus();
    const startW = windowState.width; const startH = windowState.height;
    const startX = e.clientX; const startY = e.clientY;
    const startXP = windowState.x; const startYP = windowState.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX; const dy = moveEvent.clientY - startY;
      let newX = windowState.x; let newY = windowState.y;
      let newW = windowState.width; let newH = windowState.height;
      const minW = 800; const minH = 400;

      if (direction.includes('e')) newW = Math.max(minW, startW + dx);
      if (direction.includes('s')) newH = Math.max(minH, startH + dy);
      if (direction.includes('w')) {
        newW = startW - dx;
        if (newW >= minW) newX = startXP + dx; else newW = minW;
      }
      if (direction.includes('n')) {
        newH = startH - dy;
        if (newH >= minH) newY = startYP + dy; else newH = minH;
      }
      onUpdateState({ x: newX, y: newY, width: newW, height: newH });
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const headers = ['#', 'Bank Country/Region', 'Bank Code', 'Bank Name', 'Branch', 'Bank Account Number', 'IBAN', 'BIC/SWIFT Code'];

  const bankData = [
    { code: 'ABL', name: 'Allied Bank Ltd', branch: '0010', account: '0010033492880011', iban: 'PK44ABPA0010033492880011' },
    { code: 'AKBL-7119', name: 'Askari Bank Ltd 7119', branch: '0251', account: '0251650507119', iban: 'PK25 ASCM 0000251650507119' },
    { code: 'AKBL-8712', name: 'Askari Bank Ltd 8712', branch: '0251', account: '0251650508712', iban: 'PK82 ASCM 0000251650508712' },
    { code: 'BAHL', name: 'Bank Al Habib', branch: '0068', account: '0068008100754001', iban: 'PK54 BAHL0068008100754001' },
    { code: 'BALF', name: 'Bank Al Falah', branch: '0851', account: '0851004673156', iban: 'PK93ALFH00650081004673156' },
    { code: 'BOP', name: 'Bank Of Punjab', branch: '6580', account: '6580103804300016', iban: 'PK26BPUN6580103804300016' },
    { code: 'BOP-E', name: 'BOP E - Stamping', branch: '6580', account: '6580005197800044', iban: 'PK55BPUN6580005197800044' },
    { code: 'DIB', name: 'Dubai Islamic Bank', branch: '0710', account: '0710257305001', iban: 'PK59DUIB0000000257305001' },
    { code: 'FBL', name: 'Faysal Bank', branch: '0149', account: '0149145900230242', iban: 'PK11FAYS0149145900230242' },
    { code: 'HBL-7501', name: 'Habib Bank Ltd(GM)', branch: '0008', account: '0008707901807501', iban: 'PK15 HABB0008707901807501' },
    { code: 'HBL-8901', name: 'Habib Bank Ltd(Cantt)', branch: '1692', account: '16927900818901', iban: 'PK07HABB0016927900818901' },
    { code: 'JSB', name: 'JS Bank', branch: '9056', account: '90560001467510', iban: 'PK69JSBL905600001467510' },
    { code: 'MBL', name: 'Meezan Bank', branch: '2206', account: '2206-0104603050', iban: 'PK59 MEZN 0022060104603050' },
  ];

  return (
    <div
      className='fixed flex flex-col bg-[#f0f0f0] border border-[#808080] shadow-xl rounded-[3px] overflow-hidden select-none'
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.width,
        height: windowState.height,
        zIndex: windowState.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Resize Handles */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={handleResize('n')} className='absolute top-0 left-0 right-0 h-1 cursor-ns-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('s')} className='absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('e')} className='absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('w')} className='absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize z-50 hover:bg-orange-400/20' />
          <div onMouseDown={handleResize('nw')} className='absolute top-0 left-0 w-2 h-2 cursor-nwse-resize z-[60] hover:bg-orange-400/40' />
          <div onMouseDown={handleResize('ne')} className='absolute top-0 right-0 w-2 h-2 cursor-nesw-resize z-[60] hover:bg-orange-400/40' />
          <div onMouseDown={handleResize('sw')} className='absolute bottom-0 left-0 w-2 h-2 cursor-nesw-resize z-[60] hover:bg-orange-400/40' />
          <div onMouseDown={handleResize('se')} className='absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-[60] hover:bg-orange-400/40 flex items-end justify-end'>
            <div className='w-1.5 h-1.5 border-r border-b border-gray-400 m-0.5' />
          </div>
        </>
      )}

      {/* Title Bar */}
      <div onMouseDown={handleDrag} className='h-[24px] bg-gradient-to-b from-[#808080] to-[#606060] flex items-center justify-between px-2 cursor-default shrink-0'>
        <span className='text-white text-[11px] font-bold'>House Bank Accounts Query</span>
        <WindowControls onClose={onClose} onMinimize={() => onUpdateState({ isMinimized: true })} onMaximize={() => {}} />
      </div>

      <div className='flex flex-col flex-1 p-2 bg-[#f0f0f0] overflow-hidden'>
        {/* Table Area */}
        <div className='flex-1 border border-gray-300 bg-white overflow-hidden flex flex-col'>
            <div className='flex items-start overflow-hidden relative group'>
                {/* Selection arrow placeholder for row 4 like in photo */}
                <div className='absolute left-[-2px] top-[72px] w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-black z-10' />
                
                <ClassicTable headers={headers} rowCount={15}>
                    {bankData.map((bank, i) => (
                    <tr key={i} className={cn('border-b border-[#f0f0f0] h-[18px]', i === 3 ? 'bg-orange-100/50' : 'bg-white')}>
                        <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 text-center w-[30px]'>{i + 1}</td>
                        <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 w-[130px]'>
                            <div className='flex items-center gap-1'>
                                <div className='bg-orange-100 border border-orange-400 p-0.5 rounded-[1px] flex items-center justify-center'>
                                    <ChevronRight className='w-2.5 h-2.5 text-orange-600 font-bold' />
                                </div>
                                <span>PK</span>
                            </div>
                        </td>
                        <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 w-[80px]'>{bank.code}</td>
                        <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 w-[180px]'>{bank.name}</td>
                        <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 w-[60px]'>{bank.branch}</td>
                        <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 w-[150px]'>{bank.account}</td>
                        <td className='border-r border-[#f0f0f0] p-0 text-[10.5px] px-1 w-[220px]'>{bank.iban}</td>
                        <td className='p-0 text-[10.5px] px-1 flex-1'></td>
                    </tr>
                    ))}
                    {[...Array(2)].map((_, i) => (
                    <tr key={i + bankData.length} className='border-b border-[#f0f0f0] h-[18px] bg-white'>
                        {[...Array(8)].map((_, j) => (
                            <td key={j} className='border-r border-[#f0f0f0] p-0 h-[18px] px-1'></td>
                        ))}
                    </tr>
                    ))}
                </ClassicTable>
            </div>
        </div>

        {/* Display Query Results Section */}
        <div className='flex items-center gap-2 mt-2 px-1 cursor-pointer hover:bg-gray-200 w-fit rounded-[2px] py-0.5'>
            <div className='w-0 h-0 border-t-[4px] border-t-black border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent mt-1' />
            <span className='text-[10.5px] font-bold text-gray-700'>Display Query Results</span>
        </div>
      </div>

      {/* Footer Area */}
      <div className='h-[40px] bg-[#f0f0f0] border-t border-gray-300 p-2 px-3 flex items-center justify-between shrink-0'>
        <YellowBtn className='px-10 h-[22px]'>OK</YellowBtn>
        
        <div className='flex items-center gap-20'>
            <YellowBtn className='px-6 h-[22px]'>Copy Data</YellowBtn>
            <div className='bg-gray-200 border border-gray-400 p-1 flex items-center justify-center rounded-[1px] hover:bg-gray-300 cursor-pointer shadow-sm'>
                <BarChart3 className='w-4 h-4 text-gray-700' />
            </div>
        </div>
      </div>
    </div>
  );
};
