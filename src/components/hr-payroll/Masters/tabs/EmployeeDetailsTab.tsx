import React from 'react';
import type { EmployeeCategory, Grade } from '../../../../api/payroll-masters.api';
import type { Shift, Position } from '../../../../api/hr.api';
import type { Department } from '../../../../api/departments.api';
import type { EmployeeFormState } from '../EmployeeCurrentInformationWindow';

interface Props {
  form: EmployeeFormState;
  onChange: (patch: Partial<EmployeeFormState>) => void;
  categories: EmployeeCategory[];
  grades: Grade[];
  shifts: Shift[];
  positions: Position[];
  departments: Department[];
  disabled?: boolean;
}

const inputCls = "w-full h-[18px] border border-gray-300 px-1 text-[10.5px] outline-none focus:border-orange-400 disabled:bg-gray-100";
const yellowInputCls = "w-full h-[18px] border border-gray-300 px-1 text-[10.5px] outline-none focus:border-orange-400 bg-[#fff9c4] disabled:bg-gray-100";
const selectCls = "w-full h-[18px] border border-gray-300 px-1 text-[10.5px] outline-none focus:border-orange-400 bg-white disabled:bg-gray-100";
const label = "w-[150px] text-[10.5px] text-gray-700 shrink-0";
const row = "flex items-center h-[20px] gap-1";

export const EmployeeDetailsTab: React.FC<Props> = ({
  form, onChange, categories, grades, shifts, positions, departments, disabled,
}) => {
  const set = <K extends keyof EmployeeFormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [key]: e.target.value } as any);

  return (
    <div className="flex gap-8 p-4 bg-white min-h-full">
      {/* Left Column */}
      <div className="flex flex-col gap-1 w-[420px]">
        <div className="text-[11px] font-bold text-gray-800 mb-1">Personal Details</div>

        <div className={row}>
          <label className={label}>Employee Code *</label>
          <input className={yellowInputCls} value={form.employeeNumber} onChange={set('employeeNumber')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Employee Name *</label>
          <input className={inputCls} value={form.name} onChange={set('name')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Father Name</label>
          <input className={inputCls} value={form.fatherName} onChange={set('fatherName')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Employee Category</label>
          <select className={selectCls} value={form.employeeCategoryId} onChange={set('employeeCategoryId')} disabled={disabled}>
            <option value="">—</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <div className={row}>
          <label className={label}>Grade</label>
          <select className={selectCls} value={form.gradeId} onChange={set('gradeId')} disabled={disabled}>
            <option value="">—</option>
            {grades.map((g) => <option key={g.id} value={g.id}>{g.code} — {g.description}</option>)}
          </select>
        </div>
        <div className={row}>
          <label className={label}>Gender</label>
          <select className={selectCls} value={form.gender} onChange={set('gender')} disabled={disabled}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className={row}>
          <label className={label}>Shift</label>
          <select className={selectCls} value={form.currentShiftId} onChange={set('currentShiftId')} disabled={disabled}>
            <option value="">—</option>
            {shifts.map((s) => <option key={s.id} value={s.id}>{s.code} — {s.name}</option>)}
          </select>
        </div>
        <div className={row}>
          <label className={label}>Designation</label>
          <select className={selectCls} value={form.positionId} onChange={set('positionId')} disabled={disabled}>
            <option value="">—</option>
            {positions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className={row}>
          <label className={label}>Department</label>
          <select className={selectCls} value={form.departmentId} onChange={set('departmentId')} disabled={disabled}>
            <option value="">—</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className={row}>
          <label className={label}>Section Type</label>
          <input className={inputCls} value={form.sectionType} onChange={set('sectionType')} disabled={disabled} placeholder="Staff / Worker" />
        </div>
        <div className={row}>
          <label className={label}>Date of Birth</label>
          <input type="date" className={inputCls} value={form.dateOfBirth} onChange={set('dateOfBirth')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Nationality</label>
          <input className={inputCls} value={form.nationality} onChange={set('nationality')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Home Phone</label>
          <input className={inputCls} value={form.homePhone} onChange={set('homePhone')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Mobile Phone1</label>
          <input className={inputCls} value={form.phone} onChange={set('phone')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Mobile Phone2</label>
          <input className={inputCls} value={form.mobilePhone2} onChange={set('mobilePhone2')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>E-Mail</label>
          <input type="email" className={inputCls} value={form.email} onChange={set('email')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Date of Joining</label>
          <input type="date" className={inputCls} value={form.dateOfJoining} onChange={set('dateOfJoining')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Original Date of Birth</label>
          <input type="date" className={inputCls} value={form.originalDateOfBirth} onChange={set('originalDateOfBirth')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Insurance Policy No</label>
          <input className={inputCls} value={form.insurancePolicyNo} onChange={set('insurancePolicyNo')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>PF No</label>
          <input className={inputCls} value={form.pfNo} onChange={set('pfNo')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Other Info</label>
          <input className={inputCls} value={form.otherInfo} onChange={set('otherInfo')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Fuel Liters</label>
          <input type="number" step="0.01" className={inputCls} value={form.fuelLiters} onChange={set('fuelLiters')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Address1</label>
          <input className={inputCls} value={form.address1} onChange={set('address1')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Address2</label>
          <input className={inputCls} value={form.address2} onChange={set('address2')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Address3</label>
          <input className={inputCls} value={form.address3} onChange={set('address3')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>City</label>
          <input className={inputCls} value={form.city} onChange={set('city')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Pin Code</label>
          <input className={inputCls} value={form.pinCode} onChange={set('pinCode')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>State</label>
          <input className={inputCls} value={form.state} onChange={set('state')} disabled={disabled} />
        </div>
        <div className={row}>
          <label className={label}>Status</label>
          <select className={selectCls} value={form.status} onChange={set('status')} disabled={disabled}>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="RETIRED">Retired</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col pt-2">
        <div className="flex flex-col gap-1 w-[380px] mb-6">
          <div className="text-[11px] font-bold text-gray-800 mb-1">Other</div>
          <div className={row}>
            <label className={label}>Serial No.</label>
            <input className={inputCls} value={form.serialNo} onChange={set('serialNo')} disabled={disabled} />
          </div>
          <div className={row}>
            <label className={label}>Location / Project Site</label>
            <input className={inputCls} value={form.locationProjectSite} onChange={set('locationProjectSite')} disabled={disabled} />
          </div>
          <div className={row}>
            <label className={label}>ESI No</label>
            <input className={inputCls} value={form.esiNo} onChange={set('esiNo')} disabled={disabled} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-gray-800">Administration</div>
          <div className="flex flex-col gap-1 w-[220px]">
            {['Qual., Skills & Training', 'Previous Employment', 'Medical Background', 'Family Details', 'ID Details', 'Language Details'].map((btn) => (
              <button
                key={btn}
                type="button"
                disabled
                title="Managed elsewhere in Human Resources — not part of this master"
                className="w-full h-[22px] bg-gradient-to-b from-[#f5f5f5] to-[#e5e5e5] border border-gray-300 rounded-sm text-[10.5px] font-medium text-gray-400 cursor-not-allowed"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
