import React from 'react';
import { Camera, X, ChevronDown } from 'lucide-react';

const ClassicInput = ({ value, className = "", highlighted = false, readOnly = false }: { value: string, className?: string, highlighted?: boolean, readOnly?: boolean }) => (
  <div className={`relative flex-1 ${className}`}>
    <input
      type="text"
      defaultValue={value}
      readOnly={readOnly}
      className={`w-full border border-gray-400 h-[18px] outline-none px-1.5 text-[10.5px] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)] ${highlighted ? 'bg-[#fff9c4]' : 'bg-white'}`}
    />
  </div>
);

const ClassicSelect = ({ value, className = "" }: { value: string, className?: string }) => (
  <div className={`relative flex-1 ${className}`}>
    <div className="w-full border border-gray-400 h-[18px] bg-white flex items-center px-1.5 text-[10.5px] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.1)] cursor-default">
      {value}
      <div className="absolute right-0 top-0 bottom-0 w-[16px] bg-gradient-to-b from-[#eeeeee] to-[#cccccc] border-l border-gray-400 flex items-center justify-center cursor-pointer hover:from-white hover:to-[#dddddd]">
        <ChevronDown className="w-3 h-3 text-gray-600" />
      </div>
    </div>
  </div>
);

const AdminButton = ({ label }: { label: string }) => (
  <button className="w-full h-[22px] bg-gradient-to-b from-[#fff2b3] via-[#ffeb99] to-[#ffd700] border border-gray-500 rounded-[2px] text-[10px] font-bold text-gray-800 shadow-sm hover:from-white hover:to-[#ffcc00] active:shadow-inner relative overflow-hidden group">
    <div className="absolute inset-0 border-t border-l border-white/60 pointer-events-none" />
    {label}
  </button>
);

const ImageBox = () => (
  <div className="w-[130px] h-[150px] bg-white border border-gray-400 shadow-sm relative flex items-center justify-center">
    <div className="flex flex-col gap-1 absolute -right-6 top-0">
       <button className="p-0.5 bg-gray-100 border border-gray-400 rounded-sm shadow-sm hover:bg-white"><Camera size={14} className="text-gray-700" /></button>
       <button className="p-0.5 bg-gray-100 border border-gray-400 rounded-sm shadow-sm hover:bg-white"><X size={14} className="text-red-500 font-bold" /></button>
    </div>
    <div className="flex flex-col gap-1 absolute -right-6 bottom-0">
       <button className="p-0.5 bg-gray-100 border border-gray-400 rounded-sm shadow-sm hover:bg-white"><Camera size={14} className="text-gray-700" /></button>
    </div>
  </div>
);

export const EmployeeDetailsTab: React.FC = () => {
  return (
    <div className="flex gap-4 p-2 select-none overflow-y-auto max-h-[500px] custom-scrollbar">
      {/* Left Column */}
      <div className="w-[300px] flex flex-col gap-1">
        <div className="text-[11px] font-bold text-blue-800 mb-1 border-b border-blue-200">Personal Details</div>
        
        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Employee Code *</label>
          <ClassicInput value="" highlighted={true} className="flex-1" />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Employee Name</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Father Name</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Employee Category</label>
          <ClassicSelect value="" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Grade</label>
          <ClassicSelect value="" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Gender</label>
          <ClassicSelect value="Male" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Shift</label>
          <ClassicSelect value="" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Designation</label>
          <ClassicSelect value="" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Department</label>
          <ClassicSelect value="" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Section Type</label>
          <ClassicSelect value="" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Date of Birth</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Nationality</label>
          <ClassicSelect value="" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Home Phone</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Mobile Phone1</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Mobile Phone2</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">E-Mail</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Date of Joining</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Original Date of birth</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Insurance Policy No</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">PF No</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Other Info</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Fuel Liters</label>
          <ClassicInput value="0.00" className="flex-1 text-right" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Address1</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Address2</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Address3</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">City</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">Pin Code</label>
          <ClassicInput value="" className="flex-1" />
        </div>

        <div className="flex items-center gap-2">
          <label className="w-[120px] text-[10.5px] text-gray-700 font-medium">State</label>
          <ClassicSelect value="" />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col gap-6 pt-10">
        {/* Photos Section */}
        <div className="flex gap-10">
          <ImageBox />
          <ImageBox />
        </div>

        {/* Info Right Section */}
        <div className="flex flex-col gap-1.5 w-[320px]">
           <div className="flex items-center gap-2">
             <label className="w-[140px] text-[10.5px] text-gray-700 font-medium">....No.</label>
             <ClassicInput value="" className="flex-1" />
           </div>
           <div className="flex items-center gap-2">
             <label className="w-[140px] text-[10.5px] text-gray-700 font-medium">Location / Project Site</label>
             <ClassicSelect value="" />
           </div>
           <div className="flex items-center gap-2">
             <label className="w-[140px] text-[10.5px] text-gray-700 font-medium">ESI No</label>
             <ClassicInput value="" className="flex-1" />
           </div>
        </div>

        {/* Administration Section */}
        <div className="flex flex-col items-end pt-4 pr-10">
           <div className="w-[180px] flex flex-col gap-1 text-center">
              <div className="text-[11px] font-bold text-gray-600 mb-2">Administration</div>
              <AdminButton label="Qual. , Skills & Training" />
              <AdminButton label="Previous Employment" />
              <AdminButton label="Medical Background" />
              <AdminButton label="Family Details" />
              <AdminButton label="ID Details" />
              <AdminButton label="Language Details" />
           </div>
        </div>
      </div>
    </div>
  );
};
