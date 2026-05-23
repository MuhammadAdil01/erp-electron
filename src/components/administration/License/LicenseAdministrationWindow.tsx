import React, { useState } from 'react';
import { ResizableCriteriaWindow, WindowState } from '../../ui/ResizableCriteriaWindow';
import { ChevronDown, Lock, RefreshCcw, FileUp, ArrowUpRight } from 'lucide-react';

interface LicenseAdministrationWindowProps {
  windowState: WindowState;
  onClose: () => void;
  onUpdateState: (s: Partial<WindowState>) => void;
  onFocus: () => void;
}

const sapLabelStyle = "text-[11px] text-[#333] whitespace-nowrap leading-[18px]";
const sapInputStyle = "h-[18px] border border-gray-400 px-1 text-[11px] outline-none focus:border-orange-400 bg-white w-full";
const sapButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";
const sapGreyButtonStyle = "px-3 h-[20px] bg-gradient-to-b from-[#fefefe] to-[#d1d1d1] border border-gray-500 text-[11px] shadow-sm rounded-[1px] min-w-[70px] hover:brightness-95 active:shadow-inner flex items-center justify-center";

export const LicenseAdministrationWindow: React.FC<LicenseAdministrationWindowProps> = ({
  windowState,
  onClose,
  onUpdateState,
  onFocus
}) => {
  const [activeTab, setActiveTab] = useState<'Allocation' | 'Components' | 'Assignment'>('Allocation');
  const [selectedUser, setSelectedUser] = useState('Abdul Rab Shafiq');
  const [selectedComponent, setSelectedComponent] = useState('B1INDIRECT HDB');

  const users = [
    { code: 'Abdul Rab Shafiq', name: 'Abdul Rab Shafiq' },
    { code: 'adirict', name: 'Additional Director 1' },
    { code: 'admdte', name: 'admdte' },
    { code: 'ahmad', name: 'HR User' },
    { code: 'AlertSvc', name: 'System User' },
    { code: 'Auditor', name: 'auditor' },
    { code: 'B1i', name: 'System User' },
  ];

  const components = [
    'B1INDIRECT HDB',
    'Compatibility License for AddOns',
    'SAP Business One Limited Financials User',
    'SAP Business One Limited Logistics User',
    'SAP Business One Professional User',
    'SAP AddOns',
    'Workflow',
    'B1i'
  ];

  const assignmentData = [
    { id: 1, code: 'Abdul Rab Shafiq', name: 'Abdul Rab Shafiq', locked: 'No' },
    { id: 2, code: 'AlertSvc', name: 'System User', locked: 'No' },
    { id: 3, code: 'Auditor', name: 'auditor', locked: 'No' },
    { id: 4, code: 'CRM1', name: 'CRM1', locked: 'No' },
    { id: 5, code: 'Gulshan Khan', name: 'Gulshan Khan', locked: 'No' },
    { id: 6, code: 'Hafiz Usama Aslam', name: 'Hafiz Usama Aslam', locked: 'No' },
    { id: 7, code: 'Hav Clk Amjad Hussain (Re', name: 'Hav Clk Amjad Hussain (Retd)', locked: 'No' },
  ];

  return (
    <ResizableCriteriaWindow
      title="License Administration"
      windowState={windowState}
      onClose={onClose}
      onUpdateState={onUpdateState}
      onFocus={onFocus}
      minWidth={500}
      minHeight={400}
    >
      <div className="flex-1 p-3 flex flex-col gap-2 bg-[#f0f0f0] overflow-hidden">
        
        {/* Header - License Server Info */}
        <div className="grid grid-cols-[100px_1fr_80px_1fr] gap-x-2 items-center mb-1">
           <span className={sapLabelStyle}>License Server</span>
           <input type="text" defaultValue="192.168.109.6" className={sapInputStyle} />
           <span className={`${sapLabelStyle} text-right`}>Port</span>
           <input type="text" defaultValue="40000" className={sapInputStyle} />
        </div>

        {/* Tab Bar */}
        <div className="flex bg-[#f0f0f0] border-b border-gray-400">
           {['Allocation', 'Components', 'Assignment'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-8 h-[22px] text-[11px] border border-gray-400 border-b-0 rounded-t-[3px] -ml-[1px] transition-colors ${activeTab === tab ? 'bg-white font-bold -mb-[1px] z-10' : 'bg-[#e4e4e4] hover:bg-gray-200'}`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 border border-gray-400 bg-white flex flex-col overflow-hidden p-3 shadow-inner">
           
           {activeTab === 'Allocation' && (
             <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Allocation Header */}
                <div className="grid grid-cols-[80px_1fr_80px_1fr_80px] gap-x-2 items-center">
                   <span className={sapLabelStyle}>Company</span>
                   <input type="text" defaultValue="....." className={sapInputStyle} />
                   <span className={`${sapLabelStyle} text-right`}>License</span>
                   <input type="text" defaultValue="0020545074-0001083195(Global)" className={sapInputStyle} />
                   <button className={sapGreyButtonStyle}>Change</button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                   <input type="checkbox" id="hide-locked" className="w-3.5 h-3.5" />
                   <label htmlFor="hide-locked" className={sapLabelStyle}>Hide Locked Users</label>
                </div>

                {/* Split Table View */}
                <div className="flex-1 flex gap-4 overflow-hidden">
                   {/* Left: User List */}
                   <div className="flex-1 border border-gray-300 flex flex-col overflow-hidden">
                      <div className="flex-1 overflow-auto custom-scrollbar">
                         <table className="w-full border-collapse text-[11px]">
                            <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-300 z-10">
                               <tr className="h-[20px]">
                                  <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] w-1/2">User Code</th>
                                  <th className="px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] w-1/2">
                                     <div className="flex items-center justify-between">
                                        <span>User Name</span>
                                        <ArrowUpRight className="w-3 h-3 text-blue-600" />
                                     </div>
                                  </th>
                               </tr>
                            </thead>
                            <tbody>
                               {users.map((user, i) => (
                                 <tr 
                                   key={i} 
                                   onClick={() => setSelectedUser(user.code)}
                                   className={`h-[18px] border-b border-gray-100 cursor-pointer ${selectedUser === user.code ? 'bg-[#ffed99]' : 'hover:bg-[#ffed99]/30'}`}
                                 >
                                    <td className="border-r border-gray-300 px-1">{user.code}</td>
                                    <td className="px-1">{user.name}</td>
                                 </tr>
                               ))}
                               {Array.from({ length: 15 }).map((_, i) => (
                                 <tr key={i} className="h-[18px] border-b border-gray-50">
                                    <td className="border-r border-gray-300"></td>
                                    <td></td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>

                   {/* Right: License Types */}
                   <div className="flex-1 border border-gray-300 flex flex-col overflow-hidden bg-white">
                      <div className="flex-1 overflow-auto custom-scrollbar">
                         <table className="w-full border-collapse text-[11px]">
                            <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-300 z-10">
                               <tr className="h-[20px]">
                                  <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] w-2/3">B1 User Type Licenses</th>
                                  <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Used</th>
                                  <th className="px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Available</th>
                               </tr>
                            </thead>
                            <tbody>
                               <tr className="h-[18px] border-b border-gray-100">
                                  <td className="border-r border-gray-300 px-1">B1INDIRECT HDB</td>
                                  <td className="border-r border-gray-300 text-center"><input type="checkbox" defaultChecked className="w-3 h-3" /></td>
                                  <td className="px-1 text-right pr-4">0</td>
                               </tr>
                               <tr className="h-[18px] border-b border-gray-100">
                                  <td className="border-r border-gray-300 px-1">SAP Business One Limited Financials</td>
                                  <td className="border-r border-gray-300 text-center"><input type="checkbox" className="w-3 h-3" /></td>
                                  <td className="px-1 text-right pr-4">3</td>
                               </tr>
                               <tr className="h-[20px] bg-[#f8f8f8] border-y border-gray-300 font-bold">
                                  <td className="border-r border-gray-300 px-1" colSpan={3}>External Licenses</td>
                               </tr>
                               {Array.from({ length: 20 }).map((_, i) => (
                                 <tr key={i} className="h-[18px] border-b border-gray-50">
                                    <td className="border-r border-gray-300"></td>
                                    <td className="border-r border-gray-300"></td>
                                    <td></td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Components' && (
             <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {/* Components Header */}
                <div className="grid grid-cols-[100px_1fr_100px_1fr] gap-x-2 items-center">
                   <span className={sapLabelStyle}>Licenses</span>
                   <div className="relative flex items-center">
                      <input type="text" defaultValue="0020545074-0001083195(C" className={sapInputStyle} />
                      <div className="absolute right-0 bg-[#d1d1d1] border-l border-gray-400 h-full px-1 flex items-center cursor-pointer">
                         <ChevronDown className="w-3 h-3 text-gray-800" />
                      </div>
                   </div>
                   <span className={`${sapLabelStyle} text-right`}>Localization</span>
                   <input type="text" defaultValue="Global" className={sapInputStyle} readOnly />
                   
                   <div className="col-start-3 mt-1 text-right"><span className={sapLabelStyle}>Version</span></div>
                   <div className="mt-1"><input type="text" defaultValue="10.0" className={sapInputStyle} readOnly /></div>
                </div>

                <div className="flex-1 flex gap-4 overflow-hidden mt-2">
                   {/* Left Component List */}
                   <div className="flex-[0.6] border border-gray-300 flex flex-col overflow-hidden">
                      <div className="bg-gradient-to-b from-[#fefefe] to-[#dcdcdc] h-[20px] px-1 border-b border-gray-300 flex items-center justify-between">
                         <span className="text-[11px] text-gray-700">License Components</span>
                         <ArrowUpRight className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1 overflow-auto custom-scrollbar">
                         {components.map((comp, i) => (
                           <div 
                             key={i}
                             onClick={() => setSelectedComponent(comp)}
                             className={`h-[18px] px-1 text-[11px] border-b border-gray-100 cursor-pointer flex items-center ${selectedComponent === comp ? 'bg-[#ffed99]' : 'hover:bg-[#ffed99]/30'}`}
                           >
                              {comp}
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Right Details */}
                   <div className="flex-[0.4] flex flex-col gap-1 mt-8">
                      <div className="grid grid-cols-[120px_1fr] gap-x-2 items-center">
                         <span className={sapLabelStyle}>Total Number</span>
                         <input type="text" defaultValue="1" className={sapInputStyle} readOnly />
                         
                         <span className={sapLabelStyle}>Available Licenses</span>
                         <input type="text" defaultValue="0" className={sapInputStyle} readOnly />
                         
                         <span className={sapLabelStyle}>Start Date</span>
                         <input type="text" defaultValue="23.12.25" className={sapInputStyle} readOnly />
                         
                         <span className={sapLabelStyle}>Expiration Date</span>
                         <input type="text" defaultValue="30.06.26" className={sapInputStyle} readOnly />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Assignment' && (
             <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                   <input type="checkbox" id="assign-hide-locked" className="w-3.5 h-3.5" />
                   <label htmlFor="assign-hide-locked" className={sapLabelStyle}>Hide Locked Users</label>
                </div>
                
                <div className="flex-1 border border-gray-300 overflow-hidden flex flex-col shadow-inner">
                   <div className="flex-1 overflow-auto custom-scrollbar">
                      <table className="w-full border-collapse text-[11px] table-fixed min-w-[800px]">
                         <thead className="sticky top-0 bg-[#f8f8f8] border-b border-gray-400 z-10">
                            <tr className="h-[22px]">
                               <th className="w-[30px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">#</th>
                               <th className="w-[120px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">User Code</th>
                               <th className="w-[150px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">User Name</th>
                               <th className="w-[60px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Locked</th>
                               <th className="w-[80px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Professional</th>
                               <th className="w-[120px] border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]">Limited Financials</th>
                               <th className="border-r border-gray-300 px-1 font-normal text-left text-gray-700 bg-gradient-to-b from-[#fefefe] to-[#dcdcdc]"></th>
                            </tr>
                         </thead>
                         <tbody>
                            {assignmentData.map((row, i) => (
                              <tr key={i} className="h-[18px] border-b border-gray-100 hover:bg-[#ffed99]/30">
                                 <td className="border-r border-gray-300 text-center bg-[#f0f0f0]">{row.id}</td>
                                 <td className="border-r border-gray-300 px-1">{row.code}</td>
                                 <td className="border-r border-gray-300 px-1">{row.name}</td>
                                 <td className="border-r border-gray-300 px-1">{row.locked}</td>
                                 <td className="border-r border-gray-300 px-1"></td>
                                 <td className="border-r border-gray-300 px-1"></td>
                                 <td></td>
                              </tr>
                            ))}
                            {Array.from({ length: 20 }).map((_, i) => (
                              <tr key={i} className="h-[18px] border-b border-gray-50">
                                 <td className="border-r border-gray-300 bg-[#f0f0f0]"></td>
                                 <td className="border-r border-gray-300"></td>
                                 <td className="border-r border-gray-300"></td>
                                 <td className="border-r border-gray-300"></td>
                                 <td className="border-r border-gray-300"></td>
                                 <td className="border-r border-gray-300"></td>
                                 <td></td>
                              </tr>
                            ))}
                         </tbody>
                         <tfoot className="sticky bottom-0 bg-[#f0f0f0] border-t border-gray-400 z-10 font-bold">
                            <tr className="h-[18px]">
                               <td colSpan={3} className="border-r border-gray-300 px-1 pl-4">Total Assigned</td>
                               <td className="border-r border-gray-300 px-1"></td>
                               <td className="border-r border-gray-300 px-1 text-center">5</td>
                               <td className="border-r border-gray-300 px-1 text-center">7</td>
                               <td></td>
                            </tr>
                            <tr className="h-[18px]">
                               <td colSpan={3} className="border-r border-gray-300 px-1 pl-4">Total Free</td>
                               <td className="border-r border-gray-300 px-1"></td>
                               <td className="border-r border-gray-300 px-1 text-center">0</td>
                               <td className="border-r border-gray-300 px-1 text-center">3</td>
                               <td></td>
                            </tr>
                         </tfoot>
                      </table>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Footer Area */}
        <div className="flex items-center justify-between mt-2">
           <div className="flex gap-2">
              <button onClick={onClose} className={sapButtonStyle}>OK</button>
              <button onClick={onClose} className={sapGreyButtonStyle}>Cancel</button>
           </div>
           <div className="flex gap-2">
              <div className="flex items-center justify-center w-6 h-[20px] bg-[#f0f0f0] border border-gray-500 cursor-pointer hover:bg-gray-200">
                 <Lock className="w-3 h-3 text-gray-700" />
              </div>
              <button className={sapGreyButtonStyle}>
                 <FileUp className="w-3.5 h-3.5 mr-1" />
                 Import License File
              </button>
              <button className={sapGreyButtonStyle}>
                 <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                 Refresh
              </button>
           </div>
        </div>

      </div>
    </ResizableCriteriaWindow>
  );
};
