import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FixedAssetWindowShell, GoldBtn } from '../financials/FixedAssetShared';

interface WindowState { x:number;y:number;width:number;height:number;isMinimized:boolean;isMaximized:boolean;zIndex:number; }
interface Props { windowState:WindowState; onClose:()=>void; onUpdateState:(s:Partial<WindowState>)=>void; onFocus:()=>void; }

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";

const SelectionShell: React.FC<Props & { title:string; children:React.ReactNode }> = ({ title, children, ...props }) => (
  <FixedAssetWindowShell title={title} {...props} minWidth={400} minHeight={250}>
    <div className="flex-1 overflow-auto bg-[#f0f0f0] p-3 flex flex-col gap-2">
      {children}
    </div>
    <div className="px-3 py-2 shrink-0 bg-[#f0f0f0] border-t border-gray-300 flex gap-2">
       <GoldBtn onClick={props.onClose} className="px-8!">OK</GoldBtn>
       <GoldBtn onClick={props.onClose} className="px-8! bg-[#ececec] text-[#333]">Cancel</GoldBtn>
    </div>
  </FixedAssetWindowShell>
);

export const SelectionUsersWindow: React.FC<Props> = (props) => (
  <SelectionShell title="Users" {...props}>
    <div className="flex items-center gap-2 mb-2">
      <span className={sapLabelStyle}>Find</span>
      <input className="flex-1 h-[18px] border border-gray-400 px-1 text-[11px]" />
    </div>
    <div className="flex-1 bg-white border border-gray-400 overflow-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300">
          <tr>
            <th className="w-8 border-r border-gray-300 px-1 font-normal text-left">#</th>
            <th className="w-32 border-r border-gray-300 px-2 font-normal text-left">User Name</th>
            <th className="w-32 border-r border-gray-300 px-2 font-normal text-left">Department</th>
            <th className="w-32 border-r border-gray-300 px-2 font-normal text-left">Branch</th>
            <th className="px-2 font-normal text-left">Select</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 76, name: 'Security', dept: 'Security', branch: 'Security Br' },
            { id: 77, name: 'admdte', dept: 'ADM Br', branch: 'Adm Br' },
            { id: 78, name: 'transfer & Record', dept: 'T&R', branch: 'T&R Br' },
            { id: 79, name: 'landdte', dept: 'Land', branch: 'Land Br' },
            { id: 80, name: 'legaldte', dept: 'legal', branch: 'Legal Dte' },
            { id: 81, name: 'mktgdte', dept: 'Marketing', branch: 'Mktg Br' },
            { id: 82, name: 'bdjvdte', dept: 'JV Dte', branch: 'BD/ JV Dte' },
            { id: 83, name: 'transrecord', dept: 'T&R', branch: 'T&R Br' },
            { id: 84, name: 'CRM1', dept: 'Marketing', branch: 'Mrkg' },
          ].map((u) => (
            <tr key={u.id} className="border-b border-gray-100">
              <td className="border-r border-gray-100 px-1">{u.id}</td>
              <td className="border-r border-gray-100 px-2">{u.name}</td>
              <td className="border-r border-gray-100 px-2">{u.dept}</td>
              <td className="border-r border-gray-100 px-2">{u.branch}</td>
              <td className="px-2 text-center"><input type="checkbox" className="w-3 h-3" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SelectionShell>
);

export const SelectionEmployeesWindow: React.FC<Props> = (props) => (
  <SelectionShell title="Employees" {...props}>
    <div className="flex items-center gap-2 mb-2">
      <span className={sapLabelStyle}>Find</span>
      <input className="flex-1 h-[18px] border border-gray-400 px-1 text-[11px]" />
    </div>
    <div className="flex-1 bg-white border border-gray-400 overflow-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300">
          <tr>
            <th className="w-10 border-r border-gray-300 px-1 font-normal text-left">#</th>
            <th className="w-48 border-r border-gray-300 px-2 font-normal text-left">Employee Name</th>
            <th className="w-32 border-r border-gray-300 px-2 font-normal text-left">Department</th>
            <th className="w-32 border-r border-gray-300 px-2 font-normal text-left">Branch</th>
            <th className="px-2 font-normal text-left">Select</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id: 118, name: 'Muhammad Zaid Zahoo', dept: 'Svc Sec', branch: 'Maint Br' },
            { id: 118, name: 'Zahoor Khan Lodhi Usa', dept: '', branch: 'Fin Br' },
            { id: 118, name: 'Muhammad Zaman (Col', dept: '', branch: '' },
            { id: 118, name: 'Aftab Gull Zar Gull Khan', dept: 'Qtg Br', branch: 'Adm & Coord dte' },
            { id: 118, name: 'Zawar Hussain Shah Dil', dept: 'Coord Br', branch: 'Coord' },
            { id: 118, name: 'Lnk/Clk Junaid Zeeshan', dept: 'Adm Br', branch: 'Adm & Coord dte' },
            { id: 119, name: 'Zulfiqar Ali Lnk Shahzac', dept: '', branch: 'Security Br' },
            { id: 119, name: 'Rohail Toni Zulfiqar Mas', dept: 'Adm Br', branch: 'Maint Br' },
            { id: 119, name: 'hussain, amjad', dept: '', branch: '' },
          ].map((e, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="border-r border-gray-100 px-1">{e.id}</td>
              <td className="border-r border-gray-100 px-2">{e.name}</td>
              <td className="border-r border-gray-100 px-2">{e.dept}</td>
              <td className="border-r border-gray-100 px-2">{e.branch}</td>
              <td className="px-2 text-center"><input type="checkbox" className="w-3 h-3" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SelectionShell>
);

export const SelectionRecipientListsWindow: React.FC<Props> = (props) => (
  <SelectionShell title="Recipient Lists" {...props}>
    <div className="flex items-center gap-2 mb-2">
      <span className={sapLabelStyle}>Find</span>
      <input className="flex-1 h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd5]" />
    </div>
    <div className="flex-1 bg-white border border-gray-400 overflow-auto">
      <table className="w-full border-collapse text-[11px]">
        <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300">
          <tr>
            <th className="w-10 border-r border-gray-300 px-1 font-normal text-left">#</th>
            <th className="border-r border-gray-300 px-2 font-normal text-left">Recipient List</th>
            <th className="w-16 px-2 font-normal text-left">Select</th>
          </tr>
        </thead>
        <tbody>
           {Array.from({length: 10}).map((_, i) => (
             <tr key={i} className="border-b border-gray-100 h-5">
               <td className="border-r border-gray-100 px-1"></td>
               <td className="border-r border-gray-100 px-2"></td>
               <td className="px-2 text-center"></td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  </SelectionShell>
);

export const SelectionPropertiesWindow: React.FC<Props> = (props) => (
  <FixedAssetWindowShell title="Properties" {...props} minWidth={450} minHeight={500}>
     <div className="flex-1 bg-[#f0f0f0] p-4 flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <input type="checkbox" defaultChecked className="w-3 h-3" />
          <span className={sapLabelStyle}>Ignore Properties</span>
        </div>
        
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-gray-600">Link</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="prop_link" className="w-3 h-3 accent-gray-600" />
            <span className={sapLabelStyle}>Or</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="prop_link" defaultChecked className="w-3 h-3 accent-gray-600" />
            <span className={sapLabelStyle}>And</span>
          </label>
        </div>

        <div className="flex items-center gap-2 text-[11px] opacity-50 pointer-events-none">
          <input type="checkbox" className="w-3 h-3" />
          <span className={sapLabelStyle}>Exactly Match</span>
        </div>

        <div className="flex-1 bg-white border border-gray-400 overflow-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300">
              <tr>
                <th className="w-8 border-r border-gray-300 px-1 font-normal text-left text-gray-700">#</th>
                <th className="border-r border-gray-300 px-2 font-normal text-left text-gray-700">Property</th>
                <th className="w-16 px-2 font-normal text-left text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length: 32}).map((_, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-[#ffed99]/30 h-[18px]">
                  <td className="border-r border-gray-100 px-1 text-center">{i+1}</td>
                  <td className="border-r border-gray-100 px-2">Business Partners Property {i+1}</td>
                  <td className="px-2 text-center"><input type="checkbox" className="w-3 h-3" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <button className="px-4 h-[20px] bg-gradient-to-b from-white to-gray-300 border border-gray-500 rounded-sm text-[11px]">Clear Selection</button>
          <button className="px-4 h-[20px] bg-gradient-to-b from-white to-gray-300 border border-gray-500 rounded-sm text-[11px]">Invert Selection</button>
          <button className="px-4 h-[20px] bg-gradient-to-b from-white to-gray-300 border border-gray-500 rounded-sm text-[11px]">Select All</button>
        </div>
     </div>
     <div className="px-3 py-2 shrink-0 bg-[#f0f0f0] border-t border-gray-300 flex gap-2">
        <GoldBtn onClick={props.onClose} className="px-8!">OK</GoldBtn>
        <GoldBtn onClick={props.onClose} className="px-8! bg-[#ececec] text-[#333]">Cancel</GoldBtn>
     </div>
  </FixedAssetWindowShell>
);

export const SelectionUdfWindow: React.FC<Props> = (props) => (
  <SelectionShell title="User-Defined Fields" {...props}>
     <div className="flex-1 bg-white border border-gray-400 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300">
            <tr>
              <th className="w-10 border-r border-gray-300 px-1 font-normal text-left text-gray-700">#</th>
              <th className="border-r border-gray-300 px-2 font-normal text-left text-gray-700">Field</th>
              <th className="border-r border-gray-300 px-2 font-normal text-left text-gray-700">Rule</th>
              <th className="border-r border-gray-300 px-2 font-normal text-left text-gray-700">Value</th>
              <th className="px-2 font-normal text-left text-gray-700">To Value</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({length: 12}).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 h-5 hover:bg-gray-50">
                <td className="border-r border-gray-100 px-1 text-center bg-[#f8f8f8]">{i+1}</td>
                <td className="border-r border-gray-100 px-2"></td>
                <td className="border-r border-gray-100 px-2"></td>
                <td className="border-r border-gray-100 px-2"></td>
                <td className="px-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
     </div>
     <div className="flex justify-end mt-2">
        <button className="px-4 h-[20px] bg-gradient-to-b from-white to-gray-300 border border-gray-500 rounded-sm text-[11px]">Clear</button>
     </div>
  </SelectionShell>
);

export const SelectionBusinessPartnersWindow: React.FC<Props> = (props) => (
  <FixedAssetWindowShell title="List of Business Partners" {...props} minWidth={600} minHeight={400}>
     <div className="flex-1 overflow-auto bg-[#f0f0f0] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <span className={sapLabelStyle}>Find</span>
          <input className="flex-1 h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd5]" />
        </div>
        <div className="flex-1 bg-white border border-gray-400 overflow-auto">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300">
              <tr>
                <th className="w-8 border-r border-gray-300 px-1 font-normal text-left text-gray-700">#</th>
                <th className="w-48 border-r border-gray-300 px-2 font-normal text-left text-gray-700">
                   <div className="flex items-center gap-1">BP Code <ChevronDown className="w-3 h-3 text-gray-800" /></div>
                </th>
                <th className="border-r border-gray-300 px-2 font-normal text-left text-gray-700 whitespace-nowrap">BP Name</th>
                <th className="w-4"></th>
              </tr>
            </thead>
            <tbody>
              {[
                '0/1OL/000849/', '0/1OL/006433/', '0/1OL/070134/', '0/1OL/GP3019/B',
                '01//OL//00459/5', '01//OL/000690/', '01//OL/001101/', '01//OL/001115/',
                '01//OL/001146/', '01//OL/004686/'
              ].map((code, idx) => (
                <tr key={idx} className={`h-5 border-b border-gray-100 ${idx===0 ? 'bg-[#ffed99]' : ''}`}>
                  <td className="border-r border-gray-100 px-1 text-center">{idx + 1}</td>
                  <td className="border-r border-gray-100 px-2">{code}</td>
                  <td className="border-r border-gray-100 px-2"></td>
                  <td></td>
                </tr>
              ))}
              {Array.from({length: 10}).map((_, i) => (
                <tr key={i+10} className="h-5 border-b border-gray-100">
                  <td className="border-r border-gray-100 px-1 bg-gray-50"></td>
                  <td className="border-r border-gray-100 px-2"></td>
                  <td className="border-r border-gray-100 px-2"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
     </div>
     <div className="px-3 py-2 shrink-0 bg-[#f0f0f0] border-t border-gray-300 flex gap-2">
        <GoldBtn onClick={props.onClose} className="px-10!">Choose</GoldBtn>
        <GoldBtn onClick={props.onClose} className="px-10! bg-[#ececec] text-[#333]">Cancel</GoldBtn>
        <GoldBtn className="px-10! bg-[#ffffff] border-gray-500">New</GoldBtn>
     </div>
  </FixedAssetWindowShell>
);
