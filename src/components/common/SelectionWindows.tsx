import React from 'react';
<<<<<<< HEAD
import { ChevronDown } from 'lucide-react';
import { FixedAssetWindowShell, GoldBtn } from '../financials/FixedAssetShared';
=======
import { FixedAssetWindowShell, GoldBtn } from '../financials/FixedAssets/FixedAssetShared';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ResizableCriteriaWindow } from '../ui/ResizableCriteriaWindow';
>>>>>>> 79f5e6e57eb1f46aa7f40d6ef9e2b948709ba14a

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

export const SelectionAccountsWindow: React.FC<Props> = (props) => (
  <FixedAssetWindowShell title="List of Accounts" {...props} minWidth={600} minHeight={400}>
     <div className="flex-1 overflow-auto bg-[#f0f0f0] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
          <span className={sapLabelStyle}>Find</span>
          <input className="flex-1 h-[18px] border border-gray-400 px-1 text-[11px] bg-[#fffbd5]" />
        </div>
        <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-sm">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
              <tr className="h-6">
                <th className="w-8 border-r border-gray-300 px-1 font-normal text-left text-gray-700">#</th>
                <th className="w-48 border-r border-gray-300 px-2 font-normal text-left text-gray-700">
                   <div className="flex items-center justify-between">
                     <span>Account Number</span>
                     <ChevronDown className="w-3 h-3 text-gray-600" />
                   </div>
                </th>
                <th className="border-r border-gray-300 px-2 font-normal text-left text-gray-700">
                  <div className="flex items-center justify-between">
                    <span>Account Name</span>
                    <ChevronUp className="w-3 h-3 text-gray-600" />
                  </div>
                </th>
                <th className="w-4"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { code: '39001', name: 'Retained Earnings' },
                { code: '39002', name: 'Period-End Closing' },
                { code: '400000', name: 'Sales Revenue' },
                { code: '410000', name: 'Service Revenue' },
                { code: '500000', name: 'Cost of Goods Sold' },
              ].map((acc, idx) => (
                <tr key={idx} className={`h-5 border-b border-gray-100 hover:bg-[#ffed99]/20 cursor-default ${idx===0 ? 'bg-[#ffed99]' : ''}`}>
                  <td className="border-r border-gray-100 px-1 text-center text-gray-600 font-bold bg-[#e8e8e8] w-6">{idx + 1}</td>
                  <td className="border-r border-gray-100 px-2 text-[#333]">{acc.code}</td>
                  <td className="border-r border-gray-100 px-2 text-[#333]">{acc.name}</td>
                  <td></td>
                </tr>
              ))}
              {Array.from({length: 15}).map((_, i) => (
                <tr key={i+10} className="h-5 border-b border-gray-100">
                  <td className="border-r border-gray-100 px-1 bg-[#e8e8e8]"></td>
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

export const SelectionItemsWindow: React.FC<Props> = (props) => {
  const data = [
    { id: 1, code: 'AMM-00001', name: 'Ammo', stock: '900' },
    { id: 2, code: 'AMM-00002', name: 'Ammunition Cart No. 4', stock: '' },
    { id: 3, code: 'AMM-00003', name: 'Ammunition Cart No. 7', stock: '' },
    { id: 4, code: 'AMM-00004', name: 'Ammunition Cart No. 8', stock: '' },
    { id: 5, code: 'AMM-00005', name: 'Ammunition Cart No. 9', stock: '' },
    { id: 6, code: 'AMM-00006', name: 'Clay Birds Laporte (France)', stock: '' },
    { id: 7, code: 'AMM-00007', name: 'Clay Birds Crosivia (Spain)', stock: '' },
    { id: 8, code: 'AMM-00008', name: '"CDMF- 2305, 28"barrel"', stock: '' },
    { id: 9, code: 'AMM-00009', name: 'Wpns Hard Cases (Boxes)', stock: '' },
    { id: 10, code: 'AMM-00010', name: 'Fire Fighting Extinguishers', stock: '' },
  ];
  return (
    <FixedAssetWindowShell title="List of Items" {...props} minWidth={650} minHeight={450}>
      <div className="flex-1 overflow-auto bg-[#f0f0f0] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-2">
           <span className={sapLabelStyle}>Find</span>
           <input type="text" className="h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-[#fffbd0] w-64" />
        </div>
        <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar">
          <table className="w-full border-collapse text-[11px]">
            <thead className="sticky top-0 bg-[#ececec] border-b border-gray-300 z-10">
              <tr className="h-[20px]">
                <th className="w-8 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">#</th>
                <th className="w-32 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">
                  <div className="flex items-center justify-between">
                    <span>Item No.</span>
                    <ChevronDown className="w-3 h-3 text-blue-600" />
                  </div>
                </th>
                <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Item Description</th>
                <th className="w-24 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">In Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr key={i} className={`h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/30 cursor-default ${i === 0 ? 'bg-[#ffed99]' : ''}`}>
                  <td className="px-1 border-r border-gray-100 text-center">{item.id}</td>
                  <td className="px-1 border-r border-gray-100 font-medium">{item.code}</td>
                  <td className="px-1 border-r border-gray-100">{item.name}</td>
                  <td className="px-1 text-right pr-2">{item.stock}</td>
                </tr>
              ))}
              {Array.from({length: 15}).map((_, i) => (
                <tr key={i+100} className="h-[18px] border-b border-gray-100">
                  <td className="px-1 border-r border-gray-100 bg-gray-50"></td>
                  <td className="px-1 border-r border-gray-100"></td>
                  <td className="px-1 border-r border-gray-100"></td>
                  <td className="px-1"></td>
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
};

export const SelectionUsersListWindow: React.FC<Props> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus,
}) => {
  const users = [
    'Abdul Rab Shafiq', 'Additional Director ICT', 'addldir', 'admdte', 'Ahmed Raza',
    'arooj', 'Assistant Director Finance', 'Assistant Director Finance', 'asstdir', 'auditor'
  ];

  return (
    <ResizableCriteriaWindow
      title="List of Users"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={600}
      minHeight={400}
    >
      <div className="flex-1 p-3 flex flex-col gap-3 bg-[#f0f0f0] overflow-hidden">
        <div className="grid grid-cols-[80px_1fr] items-center gap-2">
           <span className="text-[11px] text-[#333]">Find</span>
           <input type="text" className="h-[18px] border border-gray-400 px-1 text-[11px] outline-none bg-[#fffbd0] w-full" />
        </div>

        <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar">
           <table className="w-full border-collapse text-[11px]">
              <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-300 z-10">
                 <tr className="h-[20px]">
                    <th className="w-8 border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">#</th>
                    <th className="px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">
                       <div className="flex items-center justify-between">
                          <span>User Name</span>
                          <ChevronDown className="w-3 h-3 text-gray-800" />
                       </div>
                    </th>
                 </tr>
              </thead>
              <tbody>
                 {users.map((name, i) => (
                   <tr key={i} className={`h-[18px] border-b border-gray-50 hover:bg-[#ffed99]/30 ${i === 0 ? 'bg-[#ffed99]' : ''}`}>
                      <td className="w-8 border-r border-gray-100 text-center text-gray-500">{i + 1}</td>
                      <td className="px-1">{name}</td>
                   </tr>
                 ))}
                 {Array.from({ length: 15 }).map((_, i) => (
                    <tr key={i} className="h-[18px] border-b border-gray-50">
                       <td className="w-8 border-r border-gray-100"></td>
                       <td></td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        <div className="flex gap-2 shrink-0">
           <button className="px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px]">Choose</button>
           <button onClick={onClose} className="px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px]">Cancel</button>
           <button className="px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px]">New</button>
        </div>
      </div>
    </ResizableCriteriaWindow>
  );
};
