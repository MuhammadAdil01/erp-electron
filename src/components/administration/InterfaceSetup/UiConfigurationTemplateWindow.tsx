import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown } from 'lucide-react';

interface UiConfigurationTemplateWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const UiConfigurationTemplateWindow: React.FC<UiConfigurationTemplateWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState<'Forms' | 'AssignedUsers' | 'AssignedGroups'>('Forms');
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  const templates = [
    { id: 1, name: 'Standard' },
    { id: 2, name: 'Additional Director' },
    { id: 3, name: 'Backup2' },
    { id: 4, name: 'Assistant Director' },
    { id: 5, name: 'Secretary' },
    { id: 6, name: 'PD' },
    { id: 7, name: 'Manual' },
    { id: 8, name: 'Project' },
    { id: 9, name: 'Business Partner' },
  ];

  const forms = [
    { id: 1, name: 'A/P Invoice' },
    { id: 2, name: 'Purchase Request' },
    { id: 3, name: 'Purchase Quotation' },
  ];

  const users = [
    { code: 'finance4', name: 'Receipts Coordinator' },
    { code: 'Hafiz Usama Aslam', name: 'Hafiz Usama Aslam' },
    { code: 'procurement', name: 'Procurement User' },
    { code: 'Hav Talib Hussain (Retd)', name: 'Hav Talib Hussain (Retd)' },
    { code: 'finance5', name: 'Property Manager' },
    { code: 'finance3', name: 'Payments/Asset Coordinator' },
    { code: 'admdte', name: 'admdte' },
    { code: 'finance2', name: 'Budgeting Coordinator' },
    { code: 'manager', name: 'manager' },
    { code: 'mktgdte', name: 'mktgdte' },
    { code: 't&rdte', name: 'transfer & Record' },
    { code: 'ahmad', name: 'HR User' },
    { code: 'legaldte', name: 'legaldte' },
    { code: 'zeeshan', name: 'Assistant Director Finance' },
    { code: 'proj1', name: 'Project Management' },
  ];

  return (
    <ResizableCriteriaWindow
      title="UI Configuration Template"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={850}
      minHeight={550}
    >
      <div className="flex-1 p-3 flex gap-3 bg-[#f0f0f0] overflow-hidden">
        
        {/* Left Side: UI Template List */}
        <div className="w-[180px] flex flex-col gap-1 shrink-0">
          <span className={sapLabelStyle}>UI Template</span>
          <div className="flex-1 bg-white border border-gray-400 overflow-auto shadow-inner custom-scrollbar">
            <table className="w-full border-collapse text-[11px]">
               <tbody>
                  {templates.map(t => (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`h-[18px] border-b border-gray-100 cursor-default ${selectedTemplate === t.id ? 'bg-[#ffed99]' : 'hover:bg-gray-50'}`}
                    >
                      <td className="w-6 text-center border-r border-gray-100 text-gray-500">{t.id}</td>
                      <td className="px-1">{t.name}</td>
                    </tr>
                  ))}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <tr key={i} className="h-[18px] border-b border-gray-100">
                      <td className="w-6 border-r border-gray-100"></td>
                      <td></td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Configuration Details */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          
          <div className="grid grid-cols-[80px_200px] gap-y-2 items-center">
             <span className={sapLabelStyle}>Name</span>
             <input type="text" className={`${sapInputStyle} !bg-[#fffbd0]`} defaultValue="Standard" />
             
             <span className={sapLabelStyle}>Description</span>
             <input type="text" className={`${sapInputStyle} w-[300px]!`} defaultValue="General" />
          </div>

          <div className="flex-1 flex flex-col border border-gray-400 bg-white shadow-inner overflow-hidden">
             {/* Tabs */}
             <div className="flex bg-[#f0f0f0] border-b border-gray-400 px-4">
                <button 
                  onClick={() => setActiveTab('Forms')}
                  className={`px-6 h-[22px] text-[11px] border border-gray-400 border-b-0 rounded-t-[3px] transition-colors ${activeTab === 'Forms' ? 'bg-white font-bold -mb-[1px]' : 'bg-[#e4e4e4] hover:bg-gray-200'}`}
                >
                  Forms
                </button>
                <button 
                  onClick={() => setActiveTab('AssignedUsers')}
                  className={`px-6 h-[22px] text-[11px] border border-gray-400 border-b-0 rounded-t-[3px] -ml-[1px] transition-colors ${activeTab === 'AssignedUsers' ? 'bg-white font-bold -mb-[1px]' : 'bg-[#e4e4e4] hover:bg-gray-200'}`}
                >
                  Assigned Users
                </button>
                <button 
                  onClick={() => setActiveTab('AssignedGroups')}
                  className={`px-6 h-[22px] text-[11px] border border-gray-400 border-b-0 rounded-t-[3px] -ml-[1px] transition-colors ${activeTab === 'AssignedGroups' ? 'bg-white font-bold -mb-[1px]' : 'bg-[#e4e4e4] hover:bg-gray-200'}`}
                >
                  Assigned Groups
                </button>
             </div>

             {/* Tab Content */}
             <div className="flex-1 p-3 overflow-hidden flex flex-col">
                {activeTab === 'Forms' && (
                  <>
                    <div className="flex-1 border border-gray-300 overflow-auto custom-scrollbar">
                      <table className="w-full border-collapse text-[11px]">
                         <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-300">
                           <tr className="h-[20px]">
                              <th className="px-4 font-normal text-left text-gray-700">Forms</th>
                           </tr>
                         </thead>
                         <tbody>
                            {forms.map(f => (
                              <tr key={f.id} className="h-[18px] border-b border-gray-50 hover:bg-gray-50 cursor-default">
                                <td className="px-1 flex items-center gap-2">
                                  <span className="w-4 text-center text-gray-500">{f.id}</span>
                                  <span>{f.name}</span>
                                </td>
                              </tr>
                            ))}
                            {Array.from({ length: 20 }).map((_, i) => (
                              <tr key={i} className="h-[18px] border-b border-gray-50">
                                <td className="px-1 flex items-center gap-2">
                                  <span className="w-4"></span>
                                  <div className="flex-1 h-3 flex items-center justify-end px-1">
                                    {i === 0 && <ChevronDown className="w-3 h-3 text-gray-400" />}
                                  </div>
                                </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                       <button className={sapGreyButtonStyle}>Edit Form UI</button>
                       <button className={sapGreyButtonStyle}>Copy To</button>
                    </div>
                  </>
                )}

                {activeTab === 'AssignedUsers' && (
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-3.5 h-3.5" />
                      <span className={sapLabelStyle}>Hide Locked Users</span>
                    </label>
                    <div className="flex-1 border border-gray-300 overflow-auto custom-scrollbar">
                       <table className="w-full border-collapse text-[11px]">
                          <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-300">
                             <tr className="h-[20px]">
                                <th className="w-8 border-r border-gray-300"></th>
                                <th className="w-12 border-r border-gray-300 px-1 font-normal text-center">Select</th>
                                <th className="w-40 border-r border-gray-300 px-1 font-normal text-left">User Code</th>
                                <th className="px-1 font-normal text-left">User Name</th>
                             </tr>
                          </thead>
                          <tbody>
                             {users.map((u, i) => (
                               <tr key={u.code} className={`h-[18px] border-b border-gray-50 hover:bg-gray-50 cursor-default ${i === users.length - 1 ? 'bg-[#ffed99]' : ''}`}>
                                  <td className="w-8 border-r border-gray-100 text-center text-gray-500">{i + 43}</td>
                                  <td className="w-12 border-r border-gray-100 text-center"><input type="checkbox" className="w-3 h-3" /></td>
                                  <td className="w-40 border-r border-gray-100 px-1">{u.code}</td>
                                  <td className="px-1">{u.name}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                )}

                {activeTab === 'AssignedGroups' && (
                  <div className="flex-1 border border-gray-300 overflow-auto custom-scrollbar">
                    <table className="w-full border-collapse text-[11px]">
                       <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-300">
                          <tr className="h-[20px]">
                             <th className="w-12 border-r border-gray-300 px-1 font-normal text-center">Select</th>
                             <th className="w-40 border-r border-gray-300 px-1 font-normal text-left">Group Name</th>
                             <th className="px-1 font-normal text-left">Description</th>
                          </tr>
                       </thead>
                       <tbody>
                          {Array.from({ length: 30 }).map((_, i) => (
                            <tr key={i} className="h-[18px] border-b border-gray-50 hover:bg-gray-50">
                               <td className="w-12 border-r border-gray-100 text-center"><input type="checkbox" className="w-3 h-3" /></td>
                               <td className="w-40 border-r border-gray-100 px-1"></td>
                               <td className="px-1"></td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                )}
             </div>
          </div>

        </div>

      </div>

      <div className="h-[40px] px-3 bg-[#f0f0f0] border-t border-gray-300 flex items-center gap-2 shrink-0">
         <button className={sapButtonStyle}>OK</button>
         <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
      </div>
    </ResizableCriteriaWindow>
  );
};
