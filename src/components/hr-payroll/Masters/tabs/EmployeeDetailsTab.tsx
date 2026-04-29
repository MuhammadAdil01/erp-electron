import React from 'react';
import { ChevronDown, Camera, Trash2 } from 'lucide-react';

export const EmployeeDetailsTab: React.FC = () => {
  const leftFields = [
    { label: 'Employee Code *', value: '', yellow: true, icon: true },
    { label: 'Employee Name', value: '' },
    { label: 'Father Name', value: '' },
    { label: 'Employee Category', value: '', dropdown: true },
    { label: 'Grade', value: '', dropdown: true },
    { label: 'Gender', value: 'Male', dropdown: true },
    { label: 'Shift', value: '', dropdown: true },
    { label: 'Designation', value: '', dropdown: true },
    { label: 'Department', value: '', dropdown: true },
    { label: 'Section Type', value: '', dropdown: true },
    { label: 'Date of Birth', value: '' },
    { label: 'Nationality', value: '', dropdown: true },
    { label: 'Home Phone', value: '' },
    { label: 'Mobile Phone1', value: '' },
    { label: 'Mobile Phone2', value: '' },
    { label: 'E-Mail', value: '' },
    { label: 'Date of Joining', value: '' },
    { label: 'Original Date of birth', value: '' },
    { label: 'Insurance Policy No', value: '' },
    { label: 'PF No', value: '' },
    { label: 'Other Info', value: '' },
    { label: 'Fuel Liters', value: '0.00' },
    { label: 'Address1', value: '' },
    { label: 'Address2', value: '' },
    { label: 'Address3', value: '' },
    { label: 'City', value: '' },
    { label: 'Pin Code', value: '' },
    { label: 'State', value: '', dropdown: true },
  ];

  const adminButtons = [
    'Qual., Skills & Training',
    'Previous Employment',
    'Medical Background',
    'Family Details',
    'ID Details',
    'Language Details'
  ];

  return (
    <div className="flex gap-8 p-4 bg-white min-h-full">
      {/* Left Column */}
      <div className="flex flex-col gap-1 w-[400px]">
        <div className="text-[11px] font-bold text-gray-800 mb-1">Personal Details</div>
        {leftFields.map((field, idx) => (
          <div key={idx} className="flex items-center h-[20px]">
            <label className="w-[140px] text-[10.5px] text-gray-700">{field.label}</label>
            <div className="flex-1 relative flex items-center h-full">
              <input 
                type="text" 
                defaultValue={field.value}
                className={`w-full h-[18px] border border-gray-300 px-1 text-[10.5px] outline-none ${field.yellow ? 'bg-[#fff9c4]' : 'bg-white'}`}
              />
              {field.icon && (
                <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-gray-400 bg-gray-200 flex items-center justify-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                </div>
              )}
              {field.dropdown && (
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fdfdfd] to-[#e0e0e0] border-l border-gray-300 flex items-center justify-center cursor-pointer">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col pt-6">
        {/* Photo Section */}
        <div className="flex gap-8 mb-12">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-[120px] h-[140px] bg-white border border-gray-300 shadow-sm relative">
                <div className="absolute inset-0 border border-gray-100 m-1" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="w-6 h-6 border border-gray-400 rounded-sm bg-gradient-to-b from-white to-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:bg-white">
                   <Trash2 className="w-3.5 h-3.5 text-red-600" />
                </div>
                <div className="w-6 h-6 border border-gray-400 rounded-sm bg-gradient-to-b from-white to-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:bg-white">
                   <Camera className="w-3.5 h-3.5 text-black" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Middle Right Fields */}
        <div className="flex flex-col gap-1 w-[350px] mb-8">
           <div className="flex items-center h-[20px]">
             <label className="w-[140px] text-[10.5px] text-gray-700"> No.</label>
             <input type="text" className="flex-1 h-[18px] border border-gray-300 px-1 text-[10.5px] outline-none" />
           </div>
           <div className="flex items-center h-[20px]">
             <label className="w-[140px] text-[10.5px] text-gray-700">Location / Project Site</label>
             <div className="flex-1 relative flex items-center h-full">
                <input type="text" className="w-full h-[18px] border border-gray-300 px-1 text-[10.5px] outline-none" />
                <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#fdfdfd] to-[#e0e0e0] border-l border-gray-300 flex items-center justify-center cursor-pointer">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
             </div>
           </div>
           <div className="flex items-center h-[20px]">
             <label className="w-[140px] text-[10.5px] text-gray-700">ESI No</label>
             <input type="text" className="flex-1 h-[18px] border border-gray-300 px-1 text-[10.5px] outline-none" />
           </div>
        </div>

        {/* Administration Box */}
        <div className="flex flex-col items-center gap-2">
           <div className="text-[11px] font-bold text-gray-800">Administration</div>
           <div className="flex flex-col gap-1 w-[220px]">
              {adminButtons.map(btn => (
                <button key={btn} className="w-full h-[22px] bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/40 border border-gray-400 rounded-sm text-[10.5px] font-medium shadow-sm hover:from-white active:bg-orange-200">
                  {btn}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
