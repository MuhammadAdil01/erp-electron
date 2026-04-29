import React from 'react';
import { 
  FileText, Save, Printer, FileSpreadsheet, FileCode, Mail, Clock, 
  ChevronRight, RotateCcw, Copy, FolderOpen, Calendar, LayoutGrid, 
  TrendingUp, Share2, HelpCircle 
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  return (
    <div className="flex items-center p-1 bg-[#f0f0f0] border-b-[2px] border-[#d4d0c8] gap-1 overflow-x-auto whitespace-nowrap">
      <div className="flex gap-0.5 px-1 border-r border-[#d4d0c8]">
        <button className="p-1 hover:bg-black/5 rounded-sm"><FileText className="w-5 h-5 text-gray-700" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Save className="w-5 h-5 text-blue-800 fill-blue-800/20" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Printer className="w-5 h-5 text-gray-700" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><FileText className="w-5 h-5 text-gray-600 opacity-70" /></button> 
      </div>
      <div className="flex gap-0.5 px-1 border-r border-[#d4d0c8]">
        <button className="p-1 hover:bg-black/5 rounded-sm"><FileSpreadsheet className="w-5 h-5 text-green-700" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><FileCode className="w-5 h-5 text-gray-600" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><FileText className="w-5 h-5 text-red-700" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Mail className="w-5 h-5 text-blue-600" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Clock className="w-5 h-5 text-gray-700" /></button>
      </div>
      <div className="flex gap-0.5 px-1 border-r border-[#d4d0c8]">
        <button className="p-1 hover:bg-black/5 rounded-sm"><ChevronRight className="w-5 h-5 text-gray-400 rotate-180" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><ChevronRight className="w-5 h-5 text-gray-600 rotate-180" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><ChevronRight className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div className="flex gap-0.5 px-1 border-r border-[#d4d0c8]">
        <button className="p-1 hover:bg-black/5 rounded-sm"><RotateCcw className="w-5 h-5 text-green-600" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Copy className="w-5 h-5 text-gray-500" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><FolderOpen className="w-5 h-5 text-yellow-600" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Calendar className="w-5 h-5 text-blue-800" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Mail className="w-5 h-5 text-blue-400" /></button>
      </div>
      <div className="flex gap-0.5 px-1 border-r border-[#d4d0c8]">
        <button className="p-1 hover:bg-black/5 rounded-sm"><LayoutGrid className="w-5 h-5 text-purple-700" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><TrendingUp className="w-5 h-5 text-blue-500" /></button>
        <button className="p-1 hover:bg-black/5 rounded-sm"><Share2 className="w-5 h-5 text-blue-500" /></button>
      </div>
      <div className="flex gap-0.5 px-1">
        <button className="p-1 hover:bg-black/5 rounded-sm"><HelpCircle className="w-5 h-5 text-blue-700" /></button>
      </div>
    </div>
  );
};
