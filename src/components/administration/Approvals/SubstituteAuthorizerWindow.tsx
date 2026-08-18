import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
// FIX 1: Removed unused ChevronDown and Search imports

interface SubstituteAuthorizerWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle     = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapButtonStyle    = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

const columns = [
  { name: '#',                            width: 35  },
  { name: 'Authorizer Code',              width: 120 },
  { name: 'Authorizer Name',              width: 150 },
  { name: 'Substitute Authorizer Code',   width: 180 },
  { name: 'Substitute Authorizer Name',   width: 180 },
  { name: 'From Date',                    width: 100 },
  { name: 'To Date',                      width: 100 },
  { name: 'Template Name',                width: 150 },
  { name: 'Template Description',         width: 180 },
  { name: 'Active',                        width: 60  },
  { name: 'Date Created',                 width: 100 },
  { name: 'Time Created',                 width: 100 },
  { name: 'Created By (User Code)',       width: 150 },
  { name: 'Created By (User Name)',       width: 150 },
  { name: 'Substitute Action Performed',  width: 180 },
];

// FIX 6: Total explicit table width so table-fixed honours column widths
const TABLE_WIDTH = columns.reduce((sum, c) => sum + c.width, 0) + 60; // +60 for filler col

export const SubstituteAuthorizerWindow: React.FC<SubstituteAuthorizerWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
}) => {
  const [hideOldRows, setHideOldRows] = useState(false);

  return (
    <ResizableCriteriaWindow
      title="Substitute Authorizer for Approval Templates"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={600}
      minHeight={400}
    >
      <div className="flex-1 p-2 flex flex-col bg-[#f0f0f0] overflow-hidden">

        {/* Top Checkbox */}
        <div className="flex items-center gap-2 mb-2 ml-1">
          <input
            type="checkbox"
            id="hide-rows"
            className="w-3.5 h-3.5"
            checked={hideOldRows}
            onChange={e => setHideOldRows(e.target.checked)}
          />
          <label htmlFor="hide-rows" className={sapLabelStyle}>
            Hide Rows If &quot;To&quot; Date is Earlier Than System Date
          </label>
        </div>

        {/* Main Table Container */}
        <div className="flex-1 border border-gray-400 bg-white shadow-inner overflow-hidden flex flex-col min-h-0">
          {/* FIX 2: Replaced undefined custom-scrollbar with overflow-auto */}
          <div className="flex-1 overflow-auto min-h-0">
            {/*
              FIX 6: Added explicit style width so table-fixed correctly locks
              each column to its declared width instead of deferring to container.
            */}
            <table
              className="border-collapse text-[11px] table-fixed"
              style={{ width: TABLE_WIDTH }}
            >
              <colgroup>
                {columns.map((col, i) => (
                  <col key={i} style={{ width: col.width }} />
                ))}
                <col style={{ width: 60 }} /> {/* filler */}
              </colgroup>

              <thead className="sticky top-0 z-10">
                <tr className="h-[22px]">
                  {columns.map((col, i) => (
                    <th
                      key={i}
                      className="border-r border-b border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] truncate"
                      title={col.name}
                    >
                      {col.name}
                    </th>
                  ))}
                  {/* Filler header */}
                  <th className="border-b border-gray-300 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]" />
                </tr>
              </thead>

              <tbody>
                {/* ── Row 1 (editable / selected) ── */}
                <tr className="h-[18px] border-b border-gray-200 hover:bg-[#ffed99]/30">

                  {/* Col 0: # */}
                  <td className="border-r border-gray-300 text-center bg-[#f0f0f0] text-gray-600 font-bold">
                    1
                  </td>

                  {/*
                    Col 1: Authorizer Code (yellow editable cell with lookup button)
                    FIX 3: Replaced h-full inner div (doesn't work in <td>) with
                    flex directly on the <td> via a wrapper approach using flex items.
                  */}
                  <td className="border-r border-gray-300 px-0 bg-[#fffbd0]">
                    <div className="flex items-center justify-between h-[18px] px-1">
                      <span className="flex-1" />
                      <div className="w-[14px] h-[14px] bg-[#d1d1d1] border border-gray-500 rounded-[1px] flex items-center justify-center cursor-pointer hover:bg-gray-300 shrink-0">
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                      </div>
                    </div>
                  </td>

                  {/* Cols 2–8: Authorizer Name → Template Description (7 cells) */}
                  {Array.from({ length: 7 }, (_, i) => (
                    <td key={`r1-mid-${i}`} className="border-r border-gray-300 px-1 bg-[#f0f0f0]" />
                  ))}

                  {/* Col 9: Active — checkbox */}
                  <td className="border-r border-gray-300 px-1 text-center bg-[#f0f0f0]">
                    <input type="checkbox" defaultChecked className="w-3 h-3" />
                  </td>

                  {/* Cols 10–13: Date Created → Created By (User Name) (4 cells) */}
                  {Array.from({ length: 4 }, (_, i) => (
                    <td key={`r1-post-${i}`} className="border-r border-gray-300 px-1 bg-[#f0f0f0]" />
                  ))}

                  {/* Col 14: Substitute Action Performed */}
                  <td className="border-r border-gray-300 px-1 bg-[#f0f0f0]">No</td>

                  {/* Filler */}
                  <td className="bg-[#f0f0f0]" />
                </tr>

                {/* ── Empty Rows ── */}
                {/*
                  FIX 4: Removed the misleading JSX comment that was the only
                  content of every cell. Each td now renders cleanly empty.
                  Active column (colIndex 8 within slice) gets a centred empty
                  checkbox placeholder to stay consistent with Row 1.
                */}
                {Array.from({ length: 40 }, (_, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/20"
                  >
                    {/* Row number cell */}
                    <td className="border-r border-gray-300 text-center bg-[#f0f0f0] text-gray-400 text-[10px]">
                      {rowIndex + 2}
                    </td>

                    {/* Data cells (columns 1–14) */}
                    {columns.slice(1).map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border-r border-gray-300 px-1 ${
                          colIndex === 8 ? 'text-center' : ''  // col 9 = Active
                        }`}
                      >
                        {/* FIX 4: Render an empty (unchecked) checkbox for the Active column */}
                        {colIndex === 8 && (
                          <input type="checkbox" className="w-3 h-3" />
                        )}
                      </td>
                    ))}

                    {/* Filler */}
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer / scroll indicator */}
          <div className="h-[14px] bg-[#f0f0f0] border-t border-gray-300 flex items-center justify-end px-1 shrink-0">
            <div className="w-3.5 h-3.5 bg-white border border-gray-400 flex items-center justify-center">
              <div className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 mt-2 px-1 pb-1">
          <button onClick={onClose} className={sapButtonStyle}>OK</button>
          <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};