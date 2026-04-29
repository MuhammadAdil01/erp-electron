import React, { useState, useCallback, useEffect, useRef } from 'react';
import { X, Minus, Square, Search, ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface AssetMasterDataProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (newState: Partial<WindowState>) => void;
  onFocus: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  'General', 'Purchasing Data', 'Sales Data', 'Inventory Data',
  'Fixed Assets', 'Planning Data', 'Production Data',
  'Properties', 'Remarks', 'Attachments',
];

const SUB_TABS = ['Overview', 'Values', 'Depreciation', 'Cost Accounting', 'Attributes'];

const FINANCIAL_ROWS = [
  { label: 'Historical APC',                   val: 'PKR 0.00' },
  { label: 'Acquisition and Production Costs', val: 'PKR 0.00' },
  { label: 'Net Book Value',                   val: 'PKR 0.00' },
  { label: 'Historical NBV',                   val: 'PKR 0.00' },
  { label: 'Ordinary Depreciation',            val: 'PKR 0.00' },
  { label: 'Unplanned Depreciation',           val: 'PKR 0.00' },
  { label: 'Special Depreciation',             val: 'PKR 0.00' },
  { label: 'Write-Up',                         val: 'PKR 0.00' },
  { label: 'Salvage Value',                    val: 'PKR 0.00' },
  { label: 'Quantity',                         val: '0'        },
];

const ASSET_FIELDS: Array<{ label: string; yellow: boolean; type: 'input' | 'select' }> = [
  { label: 'Asset Class',         yellow: true,  type: 'input'  },
  { label: 'Asset Group',         yellow: false, type: 'select' },
  { label: 'Depreciation Group',  yellow: false, type: 'select' },
  { label: 'Inventory No.',       yellow: false, type: 'input'  },
  { label: 'Serial Numbers',      yellow: false, type: 'input'  },
  { label: 'Location',            yellow: false, type: 'select' },
  { label: 'Technician',          yellow: false, type: 'input'  },
  { label: 'Employee',            yellow: false, type: 'input'  },
  { label: 'Capitalization Date', yellow: true,  type: 'input'  },
];

const HEADER_CHECKS = [
  { label: 'Inventory Item',  checked: true  },
  { label: 'Sales Item',      checked: false },
  { label: 'Purchasing Item', checked: false },
  { label: 'Virtual Item',    checked: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// ── FieldInput ────────────────────────────────────────────────────────────────

interface FieldInputProps {
  value?: string;
  yellow?: boolean;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
}

const FieldInput: React.FC<FieldInputProps> = ({
  value,
  yellow = false,
  readOnly = false,
  className = '',
  placeholder = '',
}) => {
  const bg = readOnly
    ? 'bg-[#e0e0e0] cursor-not-allowed'
    : yellow
    ? 'bg-[#fffae6]'
    : 'bg-white';

  return (
    <input
      type="text"
      defaultValue={value}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`h-5 border border-gray-400 shadow-inner text-[11px] text-gray-800
        px-1 outline-none focus:border-blue-500 transition-colors ${bg} ${className}`}
    />
  );
};

// ── DropdownInput ─────────────────────────────────────────────────────────────

interface DropdownInputProps {
  value?: string;
  yellow?: boolean;
  readOnly?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DropdownInput: React.FC<DropdownInputProps> = ({
  value,
  yellow = false,
  readOnly = false,
  className = '',
  children,
}) => {
  const bg = readOnly
    ? 'bg-[#e0e0e0] cursor-not-allowed'
    : yellow
    ? 'bg-[#fffae6]'
    : 'bg-white';

  return (
    <div className={`relative h-5 border border-gray-400 shadow-inner flex items-center ${bg} ${className}`}>
      <span className="flex-1 text-[10.5px] text-gray-800 px-1 truncate">
        {children ?? value ?? ''}
      </span>
      <div className="px-0.5 border-l border-gray-400 h-full flex items-center hover:bg-gray-200 transition-colors cursor-pointer shrink-0">
        <ChevronDown className="w-3 h-3 text-gray-600" />
      </div>
    </div>
  );
};

// ── GoldBtn ───────────────────────────────────────────────────────────────────

interface GoldBtnProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  variant?: 'gold' | 'gray';
}

const GoldBtn: React.FC<GoldBtnProps> = ({
  onClick,
  className = '',
  children,
  variant = 'gold',
}) => {
  const style =
    variant === 'gold'
      ? 'bg-gradient-to-b from-[#ffed99] to-[#ffdb58] border-gray-600 text-gray-800 font-bold'
      : 'bg-gradient-to-b from-[#f8f8f8] to-[#e4e4e4] border-gray-500 text-gray-700 font-normal';

  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-0.5 border rounded-[2px] text-[10.5px]
        shadow-sm hover:brightness-95 active:shadow-inner transition-all ${style} ${className}`}
    >
      {children}
    </button>
  );
};

// ── TabBar ────────────────────────────────────────────────────────────────────

interface TabBarProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, active, onChange }) => (
  <div className="flex border-b border-gray-400 overflow-x-auto">
    {tabs.map((tab) => (
      <div
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-3 py-1.5 text-[10.5px] cursor-pointer whitespace-nowrap transition-all relative shrink-0
          ${active === tab
            ? 'bg-[#f0f0f0] border-t border-l border-r border-gray-400 font-bold -mb-px rounded-t-sm z-10'
            : 'bg-[#e5e5e5] border-t border-l border-gray-300 text-gray-600 hover:bg-gray-200 border-b border-gray-400'
          }`}
      >
        {tab}
      </div>
    ))}
    <div className="flex-1 bg-[#e5e5e5] border-t border-b border-gray-400" />
  </div>
);

// ── DataTable ─────────────────────────────────────────────────────────────────

type CellValue = string | React.ReactNode;

interface DataTableProps {
  headers: string[];
  rows: CellValue[][];
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows, className = '' }) => (
  <div className={`overflow-auto border border-gray-400 bg-white flex-1 ${className}`}>
    <table className="w-full text-left border-collapse min-w-max">
      <thead className="sticky top-0 bg-[#e5e5e5] z-10 border-b border-gray-400">
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              className="text-[10px] font-bold text-gray-700 px-2 py-1 border-r border-gray-300 whitespace-nowrap"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} className="border-b border-gray-200 hover:bg-blue-50/30 transition-colors">
            {row.map((cell, ci) => (
              <td
                key={ci}
                className={`border-r border-gray-300 px-2 py-1 text-[10.5px] text-gray-800
                  ${ci === 0 ? 'bg-gray-50 text-center font-medium' : ''}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── FieldRow ──────────────────────────────────────────────────────────────────

const FieldRow: React.FC<{
  label: string;
  labelWidth?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label, labelWidth = 'w-36', className = '', children }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <span className={`text-[11px] text-[#333] ${labelWidth} shrink-0`}>{label}</span>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// WINDOW SHELL (drag, resize, minimize, maximize)
// ─────────────────────────────────────────────────────────────────────────────

interface WindowShellProps {
  windowState: WindowState;
  onUpdateState: (state: Partial<WindowState>) => void;
  onClose: () => void;
  onFocus: () => void;
  title: string;
  minWidth?: number;
  minHeight?: number;
  children: React.ReactNode;
}

const FixedAssetWindowShell: React.FC<WindowShellProps> = ({
  windowState,
  onUpdateState,
  onClose,
  onFocus,
  title,
  minWidth = 850,
  minHeight = 600,
  children,
}) => {
  const resizeSnap = useRef({ width: 0, height: 0, x: 0, y: 0 });
  const dragOffset  = useRef({ x: 0, y: 0 });
  const mode        = useRef<'idle' | 'drag' | string>('idle');

  // ── Title bar drag start ──────────────────────────────────────────────────
  const handleTitleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (windowState.isMaximized) return;
      e.preventDefault();
      onFocus();
      dragOffset.current = { x: e.clientX - windowState.x, y: e.clientY - windowState.y };
      mode.current = 'drag';
    },
    [windowState.isMaximized, windowState.x, windowState.y, onFocus],
  );

  // ── Resize handle start ───────────────────────────────────────────────────
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      e.preventDefault();
      resizeSnap.current = {
        width:  windowState.width,
        height: windowState.height,
        x:      windowState.x,
        y:      windowState.y,
      };
      mode.current = direction;
    },
    [windowState],
  );

  // ── Global mouse move / up ────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mode.current === 'idle') return;

      if (mode.current === 'drag') {
        onUpdateState({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
        return;
      }

      const dir  = mode.current;
      const snap = resizeSnap.current;
      let newW = snap.width, newH = snap.height, newX = snap.x, newY = snap.y;

      if (dir.includes('e')) newW = Math.max(minWidth,  e.clientX - snap.x);
      if (dir.includes('s')) newH = Math.max(minHeight, e.clientY - snap.y);

      if (dir.includes('w')) {
        const potential = snap.x + snap.width - e.clientX;
        if (potential >= minWidth) { newW = potential; newX = e.clientX; }
        else                       { newW = minWidth;  newX = snap.x + snap.width - minWidth; }
      }

      if (dir.includes('n')) {
        const potential = snap.y + snap.height - e.clientY;
        if (potential >= minHeight) { newH = potential; newY = e.clientY; }
        else                        { newH = minHeight; newY = snap.y + snap.height - minHeight; }
      }

      onUpdateState({ width: newW, height: newH, x: newX, y: newY });
    };

    const handleMouseUp = () => { mode.current = 'idle'; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup',   handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup',   handleMouseUp);
    };
  }, [onUpdateState, minWidth, minHeight]);

  if (windowState.isMinimized) return null;

  return (
    <div
      onMouseDown={onFocus}
      className="absolute bg-[#f0f0f0] border border-[#d4d0c8] shadow-2xl flex flex-col font-sans select-none overflow-hidden"
      style={{
        left:   windowState.isMaximized ? 0      : windowState.x,
        top:    windowState.isMaximized ? 0      : windowState.y,
        width:  windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? 'calc(100vh - 40px)' : windowState.height,
        zIndex: windowState.zIndex,
      }}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleTitleMouseDown}
        className="h-7 bg-gradient-to-r from-[#e5e5e5] to-[#d1d1d1] flex items-center justify-between px-2 cursor-default border-b border-gray-400 shrink-0"
      >
        <span className="text-[11px] font-bold text-gray-700">{title}</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onUpdateState({ isMinimized: true })}
            className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded-sm transition-colors"
          >
            <Minus className="w-3 h-3 text-gray-700" />
          </button>
          <button
            onClick={() => onUpdateState({ isMaximized: !windowState.isMaximized })}
            className="w-5 h-5 flex items-center justify-center hover:bg-black/10 rounded-sm transition-colors"
          >
            <Square className="w-2.5 h-2.5 text-gray-700" />
          </button>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center hover:bg-red-500 rounded-sm transition-colors group"
          >
            <X className="w-3 h-3 text-gray-700 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </div>

      {/* Resize Handles — 8 directions */}
      {!windowState.isMaximized && (
        <>
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'n')}  className="absolute top-0    left-0  right-0  h-1 cursor-ns-resize    z-[60]" />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 's')}  className="absolute bottom-0 left-0  right-0  h-1 cursor-ns-resize    z-[60]" />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'e')}  className="absolute top-0    right-0 bottom-0 w-1 cursor-ew-resize    z-[60]" />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'w')}  className="absolute top-0    left-0  bottom-0 w-1 cursor-ew-resize    z-[60]" />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'nw')} className="absolute top-0    left-0  w-2 h-2 cursor-nwse-resize z-[70]" />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'ne')} className="absolute top-0    right-0 w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'sw')} className="absolute bottom-0 left-0  w-2 h-2 cursor-nesw-resize z-[70]" />
          <div onMouseDown={(e) => handleResizeMouseDown(e, 'se')} className="absolute bottom-0 right-0 w-2 h-2 cursor-nwse-resize z-[70]" />
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: DIMENSIONS PANEL
// ─────────────────────────────────────────────────────────────────────────────

const DimensionsPanel: React.FC = () => (
  <div className="space-y-6 w-full lg:w-[300px] shrink-0">
    <div className="space-y-1 border border-gray-300 p-2 bg-gray-50 shadow-sm rounded-sm">
      {['Length', 'Width', 'Height', 'Volume', 'Weight'].map((dim) => (
        <div key={dim} className="flex items-center gap-2">
          <span className="text-[10.5px] text-[#333] w-16">{dim}</span>
          <FieldInput readOnly className="flex-1" />
          {dim === 'Height' && (
            <div className="w-10 h-5 border border-gray-400 bg-white flex items-center justify-center text-[10px]">cm</div>
          )}
        </div>
      ))}
    </div>
    <div className="space-y-1">
      {[1, 2, 3, 4].map((f) => (
        <div key={f} className="flex items-center gap-2">
          <span className="text-[10.5px] text-[#333] w-24">Factor {f}</span>
          <FieldInput yellow value="1" className="w-24 text-right" />
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB: GENERAL
// ─────────────────────────────────────────────────────────────────────────────

const GeneralTab: React.FC = () => (
  <div className="flex flex-col h-full overflow-y-auto pr-2">
    <p className="text-[11px] text-gray-600 mb-6 italic pl-4">Withholding Tax Liable</p>

    <div className="flex items-center gap-2 mb-6 pl-2">
      <input type="checkbox" className="w-3.5 h-3.5" />
      <span className="text-[11px] text-[#333]">Do Not Apply Discount Groups</span>
    </div>

    <div className="w-full max-w-2xl space-y-2 mb-8 pr-4">
      <FieldRow label="Manufacturer">        <DropdownInput yellow className="flex-1" /></FieldRow>
      <FieldRow label="Additional Identifier"><FieldInput yellow className="flex-1" /></FieldRow>
      <FieldRow label="Shipping Type">       <DropdownInput yellow className="flex-1" /></FieldRow>

      <div className="pt-4 pb-1">
        <span className="text-[11px] font-bold text-blue-700 underline cursor-pointer hover:text-blue-800 transition-colors">
          Serial and Batch Numbers
        </span>
      </div>

      <FieldRow label="Manage Item by">
        <DropdownInput yellow value="None" className="flex-1" />
      </FieldRow>
    </div>

    <div className="mt-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-end pb-2">
      <div className="space-y-1.5 pl-4 shrink-0">
        {['Active', 'Inactive'].map((label, i) => (
          <label key={label} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="item-status" defaultChecked={i === 0} className="w-3.5 h-3.5" />
            <span className="text-[11px] text-gray-800 font-medium">{label}</span>
          </label>
        ))}
      </div>
      <div className="space-y-1.5 w-full">
        <FieldRow label="Linked to Resource"           labelWidth="w-48"><FieldInput yellow className="flex-1 min-w-[150px]" /></FieldRow>
        <FieldRow label="Standard Item Identification" labelWidth="w-48"><FieldInput readOnly className="flex-1 min-w-[150px]" /></FieldRow>
        <FieldRow label="Commodity Classification"     labelWidth="w-48"><FieldInput readOnly className="flex-1 min-w-[150px]" /></FieldRow>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PURCHASING DATA
// ─────────────────────────────────────────────────────────────────────────────

const PurchasingDataTab: React.FC = () => (
  <div className="flex flex-col lg:flex-row gap-8 h-full overflow-y-auto pr-2">
    <div className="flex-1 space-y-4 min-w-0">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">Preferred Vendor</span>
          <FieldInput yellow className="flex-1" />
          <GoldBtn className="min-w-0 w-8 px-0 flex items-center justify-center text-[10px]">...</GoldBtn>
        </div>
        <FieldRow label="Mfr Catalog No."><FieldInput yellow className="flex-1" /></FieldRow>
      </div>

      <div className="space-y-1.5 border-t border-gray-300 pt-3">
        <FieldRow label="Purchasing UoM Name">       <FieldInput yellow className="flex-1" /></FieldRow>
        <FieldRow label="Items per Purchasing Unit"> <FieldInput yellow value="1" className="w-24 text-right" /></FieldRow>
      </div>

      <div className="space-y-1.5 border-t border-gray-300 pt-3">
        <FieldRow label="Packaging UoM Name">  <FieldInput yellow className="flex-1" /></FieldRow>
        <FieldRow label="Quantity per Package"><FieldInput yellow value="1" className="w-24 text-right" /></FieldRow>
      </div>

      <div className="space-y-1.5 border-t border-gray-300 pt-4">
        {['Customs Group', 'Tax Group'].map((label) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[11px] text-[#333] w-36 shrink-0">{label}</span>
            <DropdownInput yellow className="flex-1" />
            <FieldInput readOnly className="w-12 text-right" />
            <span className="text-[10px]">%</span>
          </div>
        ))}
      </div>
    </div>
    <DimensionsPanel />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB: SALES DATA
// ─────────────────────────────────────────────────────────────────────────────

const SalesDataTab: React.FC = () => (
  <div className="flex flex-col lg:flex-row gap-8 h-full overflow-y-auto pr-2">
    <div className="flex-1 space-y-6 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#333] w-36 shrink-0">Tax Group</span>
        <DropdownInput yellow className="flex-1 max-w-md" />
        <FieldInput readOnly className="w-12 text-right" />
        <span className="text-[10px]">%</span>
      </div>

      <div className="space-y-1.5 pt-3">
        <FieldRow label="Sales UoM Name">     <FieldInput yellow className="flex-1" /></FieldRow>
        <FieldRow label="Items per Sales Unit"><FieldInput yellow value="1" className="w-24 text-right" /></FieldRow>
      </div>

      <div className="space-y-1.5 border-t border-gray-300 pt-3">
        <FieldRow label="Packaging UoM Name">  <FieldInput yellow className="flex-1" /></FieldRow>
        <FieldRow label="Quantity per Package"><FieldInput yellow value="1" className="w-24 text-right" /></FieldRow>
      </div>

      <FieldRow label="Create QR Code From" className="mt-8">
        <FieldInput yellow className="flex-1 h-7" />
      </FieldRow>
    </div>
    <DimensionsPanel />
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB: INVENTORY DATA
// ─────────────────────────────────────────────────────────────────────────────

const InventoryDataTab: React.FC = () => (
  <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
      <div className="space-y-2 w-full max-w-xl">
        <FieldRow label="Set G/L Accounts By">
          <DropdownInput yellow className="flex-1"><span>Item Group</span></DropdownInput>
        </FieldRow>
        <FieldRow label="UoM Name"><FieldInput yellow className="flex-1" /></FieldRow>
        <FieldRow label="Weight">  <FieldInput readOnly className="flex-1" /></FieldRow>
      </div>

      <div className="space-y-2 w-full max-w-xl">
        <div className="flex items-center gap-2 mb-2">
          <input type="checkbox" defaultChecked className="w-3.5 h-3.5" />
          <span className="text-[11px] text-gray-800 font-bold">Manage Inventory by Warehouse</span>
        </div>
        <p className="text-[11px] font-bold underline mb-1">Inventory Level</p>
        {['Required (Purchasing UoM)', 'Minimum', 'Maximum'].map((label) => (
          <FieldRow key={label} label={label} labelWidth="w-48">
            <FieldInput readOnly className="flex-1" />
          </FieldRow>
        ))}
      </div>
    </div>

    <div className="w-full max-w-xl space-y-2">
      <FieldRow label="Valuation Method"><DropdownInput yellow className="w-48" /></FieldRow>
      <FieldRow label="Item Cost">       <FieldInput yellow className="w-48" /></FieldRow>
    </div>

    <div className="flex-1 min-h-[200px] flex flex-col">
      <DataTable
        headers={['#', 'Whse Code', 'Whse Name', 'Locked', 'In Stock', 'Committed', 'Ordered', 'Available', 'Min. Inventory', 'Max. Inventory', 'Req. Inv. Level', 'Item Cost']}
        rows={Array.from({ length: 6 }).map((_, i) => [
          String(i + 1), '', '', '', '0.00', '0.00', '0.00', '0.00', '', '', '', '0.00',
        ])}
      />
    </div>

    <div className="flex justify-end pr-2 pb-2">
      <GoldBtn>Set Default Whse</GoldBtn>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB: FIXED ASSETS — SUB TABS
// ─────────────────────────────────────────────────────────────────────────────

const FixedAssetsSubTabs: React.FC<{ activeSubTab: string }> = ({ activeSubTab }) => {
  if (activeSubTab === 'Values') {
    return (
      <DataTable
        headers={['#', 'Fiscal Year', 'APC First Day', 'Acquisition', 'Retirement', 'Transfer', 'Write-Up', 'Ordinary Dep.', 'Unplanned Dep.', 'Special Dep.', 'APC Last Day', 'NBV Last Day']}
        rows={Array.from({ length: 5 }).map((_, i) => [
          String(i + 1), String(2025 + i), '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00',
        ])}
      />
    );
  }

  if (activeSubTab === 'Depreciation') {
    return (
      <DataTable
        headers={['Area', 'Dep. Type', 'Start Date', 'Useful Life', 'Remaining Life', 'Salvage Val.']}
        rows={[['MAINPA', 'LIN_ST', '01.01.2025', '120', '120', '0.00']]}
      />
    );
  }

  if (activeSubTab === 'Cost Accounting') {
    return (
      <div className="space-y-4 max-w-2xl p-4 bg-white/50 border border-gray-200 rounded-sm">
        {['Cost Center', 'Project', 'Distribution Rule'].map((label) => (
          <FieldRow key={label} label={label}>
            <DropdownInput className="flex-1" />
          </FieldRow>
        ))}
      </div>
    );
  }

  if (activeSubTab === 'Attributes') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 p-4 bg-white/50 border border-gray-200 rounded-sm">
        {Array.from({ length: 10 }).map((_, i) => (
          <FieldRow key={i} label={`Attribute ${i + 1}`} labelWidth="w-24">
            <FieldInput className="flex-1" />
          </FieldRow>
        ))}
      </div>
    );
  }

  return null;
};


const FixedAssetsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  return (
    <div className="flex flex-col h-full">
      {/* Sub Tab Bar */}
      <div className="flex border-b border-gray-300 mb-4 h-6 shrink-0">
        {SUB_TABS.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 flex items-center text-[10px] cursor-pointer transition-all border-l border-t border-r -mb-px
              ${activeSubTab === tab
                ? 'bg-white border-gray-300 font-bold z-10'
                : 'text-gray-600 border-transparent hover:bg-gray-100'
              }`}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {activeSubTab === 'Overview' ? (
          <div className="space-y-8 pb-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
              {/* Left: Asset Fields */}
              <div className="space-y-1.5 w-full max-w-xl">
                {ASSET_FIELDS.map((f) => (
                  <FieldRow key={f.label} label={f.label}>
                    {f.type === 'select'
                      ? <DropdownInput yellow={f.yellow} className="flex-1" />
                      : <FieldInput    yellow={f.yellow} className="flex-1" />}
                  </FieldRow>
                ))}
                <div className="pt-2 pl-4 space-y-1">
                  <p className="text-[10px] text-gray-500 italic">Statistical Asset</p>
                  <p className="text-[10px] text-gray-500 italic">Cession</p>
                  <p className="text-[10px] text-gray-700 italic font-bold mt-4">IFRS Posting for Revaluation</p>
                </div>
              </div>

              {/* Right: Financials */}
              <div className="space-y-1.5 w-full max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] text-gray-700 w-32 font-bold shrink-0">Depreciation Area</span>
                  <FieldInput readOnly className="flex-1" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] text-gray-700 w-32 font-bold shrink-0">Fiscal Year</span>
                  <DropdownInput className="flex-1" value="2026" />
                </div>
                {FINANCIAL_ROWS.map((v) => (
                  <div key={v.label} className="flex items-center gap-2 group">
                    <span className="text-[10.5px] text-gray-700 flex-1 group-hover:text-blue-800 transition-colors">
                      {v.label}
                    </span>
                    <FieldInput readOnly value={v.val} className="w-32 lg:w-48 text-right font-bold" />
                  </div>
                ))}
              </div>
            </div>

            {/* Depreciation Parameters Table */}
            <div className="flex flex-col mt-4">
              <span className="text-[11px] font-bold text-blue-900 underline mb-2 italic">
                Depreciation Parameters
              </span>
              <DataTable
                headers={['#', 'Depreciation Area', 'Depreciation Start Date', 'Depreciation End Date', 'Useful Life (Months)', 'Remaining Life (Months)', 'Depreciation Type']}
                rows={Array.from({ length: 3 }).map((_, i) => [String(i + 1), '', '', '', '', '', ''])}
                className="min-h-[120px]"
              />
              <div className="flex justify-end mt-2">
                <GoldBtn>Period Control</GoldBtn>
              </div>
            </div>
          </div>
        ) : (
          <FixedAssetsSubTabs activeSubTab={activeSubTab} />
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PLANNING DATA
// ─────────────────────────────────────────────────────────────────────────────

const PlanningDataTab: React.FC = () => (
  <div className="space-y-8 overflow-y-auto pr-2 h-full">
    <div className="space-y-2 w-full max-w-2xl">
      {[{ label: 'Planning Method', val: 'None' }, { label: 'Procurement Method', val: 'Buy' }].map((f) => (
        <FieldRow key={f.label} label={f.label}>
          <DropdownInput className="flex-1" value={f.val} />
        </FieldRow>
      ))}
    </div>

    <div className="space-y-2 w-full max-w-2xl border-t border-gray-300 pt-6">
      {[
        { label: 'Order Interval',    type: 'select' as const },
        { label: 'Order Multiple',    type: 'input'  as const },
        { label: 'Minimum Order Qty', type: 'input'  as const },
        { label: 'Checking Rule',     type: 'input'  as const },
      ].map((f) => (
        <FieldRow key={f.label} label={f.label}>
          {f.type === 'select'
            ? <DropdownInput className="flex-1" />
            : <FieldInput className="flex-1" />}
        </FieldRow>
      ))}
    </div>

    <div className="space-y-2 w-full max-w-2xl border-t border-gray-300 pt-6">
      {['Lead Time', 'Tolerance Days'].map((label) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-36 shrink-0">{label}</span>
          <FieldInput className="flex-1" />
          <span className="text-[11px] text-gray-700 w-12 shrink-0">Days</span>
        </div>
      ))}
    </div>
  </div>
);


const ProductionDataTab: React.FC = () => (
  <div className="space-y-10 overflow-y-auto pr-2 h-full">
    <div className="space-y-2 w-full max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" className="w-3.5 h-3.5" />
        <span className="text-[11px] text-[#333]">Phantom Item</span>
      </div>
      <FieldRow label="Issue Method">
        <DropdownInput className="flex-1" value="Backflush" />
      </FieldRow>
    </div>

    <div className="space-y-2 w-full max-w-2xl border-t border-gray-300 pt-6">
      {[
        { label: 'BOM Type',                   val: 'None' },
        { label: 'No. of Item Components',     val: '0'    },
        { label: 'No. of Resource Components', val: '0'    },
      ].map((f) => (
        <div key={f.label} className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-64 shrink-0">{f.label}</span>
          <FieldInput readOnly value={f.val} className="flex-1" />
        </div>
      ))}
    </div>

    <div className="space-y-2 w-full max-w-2xl border-t border-gray-300 pt-6">
      {[
        { label: 'No. of Route Stages', val: '0'        },
        { label: 'Production Std Cost', val: 'PKR 0.00' },
      ].map((f) => (
        <div key={f.label} className="flex items-center gap-2">
          <span className="text-[11px] text-[#333] w-64 shrink-0">{f.label}</span>
          <FieldInput readOnly value={f.val} className="flex-1" />
        </div>
      ))}
      <p className="text-[10.5px] text-blue-800 italic pl-64 underline decoration-dotted">
        Include in Production Std Cost Rollup
      </p>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TAB: PROPERTIES
// ─────────────────────────────────────────────────────────────────────────────

const PropertiesTab: React.FC = () => (
  <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
    <div className="flex-1 flex flex-col min-h-0">
      <DataTable
        headers={['#', 'Property Name']}
        rows={Array.from({ length: 14 }).map((_, i) => [
          String(i + 1),
          <div key={i} className="flex items-center gap-2">
            <input type="checkbox" className="w-3 h-3" />
            <span className="text-[11px]">Items Property {i + 1}</span>
          </div>,
        ])}
      />
    </div>
    <div className="flex flex-row lg:flex-col gap-3 pt-2 lg:pt-6 shrink-0">
      <GoldBtn className="flex-1 lg:w-32 justify-center">Select All</GoldBtn>
      <GoldBtn className="flex-1 lg:w-32 justify-center">Clear Selection</GoldBtn>
    </div>
  </div>
);


const RemarksTab: React.FC = () => (
  <div className="h-full flex flex-col">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="hidden md:block" />
      <div className="relative group">
        <textarea
          className="w-full h-48 border border-gray-400 bg-[#fffae6] shadow-inner p-3 outline-none resize-none text-[11px] text-gray-800"
          spellCheck={false}
          placeholder="Enter remarks here..."
        />
        <div className="absolute bottom-2 right-2 p-1.5 bg-gray-100 border border-gray-400 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity cursor-pointer">
          <Search className="w-4 h-4 text-gray-700" />
        </div>
      </div>
    </div>
  </div>
);

const AttachmentsTab: React.FC = () => (
  <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
    <div className="flex-1 flex flex-col min-h-0">
      <DataTable
        headers={['#', 'Target Path', 'File Name', 'Attachment Date', 'Free Text']}
        rows={Array.from({ length: 5 }).map((_, i) => [String(i + 1), '', '', '', ''])}
      />
    </div>
    <div className="flex flex-row lg:flex-col gap-2 pt-2 lg:pt-6 shrink-0">
      {['Browse', 'Display', 'Delete'].map((btn) => (
        <GoldBtn key={btn} className="flex-1 lg:w-24 justify-center text-[10px]">{btn}</GoldBtn>
      ))}
    </div>
  </div>
);


const TAB_COMPONENTS: Record<string, React.FC> = {
  'General':         GeneralTab,
  'Purchasing Data': PurchasingDataTab,
  'Sales Data':      SalesDataTab,
  'Inventory Data':  InventoryDataTab,
  'Fixed Assets':    FixedAssetsTab,
  'Planning Data':   PlanningDataTab,
  'Production Data': ProductionDataTab,
  'Properties':      PropertiesTab,
  'Remarks':         RemarksTab,
  'Attachments':     AttachmentsTab,
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT — AssetMasterDataWindow
// ─────────────────────────────────────────────────────────────────────────────

export const AssetMasterDataWindow: React.FC<AssetMasterDataProps> = (props) => {
  const [activeTab, setActiveTab] = useState('General');
  const ActiveTabComponent = TAB_COMPONENTS[activeTab] ?? GeneralTab;

  return (
    <FixedAssetWindowShell
      windowState={props.windowState}
      onUpdateState={props.onUpdateState}
      onClose={props.onClose}
      onFocus={props.onFocus}
      title="Asset Master Data"
      minWidth={900}
      minHeight={650}
    >
      <div className="flex-1 flex flex-col bg-[#f0f0f0] min-h-0 overflow-hidden">

        {/* ── Header Fields ─────────────────────────────────────────────────── */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 shrink-0">
          {/* Left: Item fields */}
          <div className="space-y-1.5 w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#333] w-28 shrink-0">Item No.</span>
              <DropdownInput yellow className="flex-1 min-w-[100px]" />
              <FieldInput yellow className="flex-1 min-w-[120px]" />
            </div>
            <FieldRow label="Description"  labelWidth="w-28"><FieldInput yellow className="flex-1" /></FieldRow>
            <FieldRow label="Foreign Name" labelWidth="w-28"><FieldInput className="flex-1 bg-white" /></FieldRow>
            <FieldRow label="Item Type"    labelWidth="w-28"><DropdownInput className="flex-1 bg-white" value="Fixed Assets" /></FieldRow>
            <FieldRow label="Item Group"   labelWidth="w-28"><DropdownInput className="flex-1 bg-white" /></FieldRow>
            <FieldRow label="UoM Group"    labelWidth="w-28"><DropdownInput className="flex-1 bg-white" /></FieldRow>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#333] w-28 shrink-0">Price List</span>
              <DropdownInput className="flex-1 bg-white max-w-[200px]" value="Price List 01" />
              <div className="w-5 h-5 flex items-center justify-center bg-gray-200 border border-gray-300 hover:bg-gray-300 cursor-pointer transition-colors shrink-0">
                <Search className="w-3 h-3 text-gray-700" />
              </div>
              <FieldInput className="flex-1 bg-white min-w-[80px]" />
            </div>
          </div>

          {/* Right: Checkboxes */}
          <div className="space-y-2 pt-2 shrink-0 lg:border-l lg:border-gray-300 lg:pl-8">
            {HEADER_CHECKS.map((c) => (
              <label key={c.label} className="flex items-center justify-between gap-4 cursor-pointer group">
                <span className={`text-[11px] font-medium transition-colors ${c.checked ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {c.label}
                </span>
                <input type="checkbox" defaultChecked={c.checked} className="w-3.5 h-3.5" />
              </label>
            ))}
          </div>
        </div>

        {/* ── Bar Code / Unit Price Row ─────────────────────────────────────── */}
        <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-12 mb-4 shrink-0">
          <div className="flex items-center gap-2 w-full max-w-2xl">
            <span className="text-[11px] text-[#333] w-28 shrink-0">Bar Code</span>
            <FieldInput className="flex-1 bg-white" />
            <GoldBtn className="min-w-0 w-8 px-0 flex items-center justify-center text-[10px]">...</GoldBtn>
          </div>
          <div className="flex items-center gap-2 w-full max-w-2xl">
            <span className="text-[11px] text-[#333] w-24 shrink-0">Unit Price</span>
            <FieldInput className="flex-1 bg-white" />
            <DropdownInput className="w-40 bg-white" value="Primary Currency" />
            <GoldBtn className="min-w-0 w-8 px-0 flex items-center justify-center text-[10px]">...</GoldBtn>
          </div>
        </div>

        {/* ── Tab Bar + Content ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 px-4 pb-4 overflow-hidden">
          <div className="shrink-0 mb-[-1px]">
            <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
          </div>
          <div className="flex-1 border border-gray-400 bg-[#f0f0f0] shadow-sm p-4 overflow-hidden flex flex-col min-h-0">
            <ActiveTabComponent />
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="p-3 flex items-center gap-3 border-t border-gray-400 bg-gray-100 shrink-0">
          <GoldBtn className="w-24 justify-center">Find</GoldBtn>
          <GoldBtn className="w-24 justify-center" onClick={props.onClose}>Cancel</GoldBtn>
        </div>
      </div>
    </FixedAssetWindowShell>
  );
};
