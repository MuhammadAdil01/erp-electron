import React, { useEffect, useState } from 'react';
import { UserSquare2 } from 'lucide-react';
import { useCrudResource } from '../../../hooks/useCrudResource';
import { employeesCrudApi, type Employee, type EmployeePayload } from '../../../api/employees.api';
import { employeeCategoriesApi, gradesApi, type EmployeeCategory, type Grade } from '../../../api/payroll-masters.api';
import { shiftsApi, positionsApi, leaveBalancesApi, type Shift, type Position } from '../../../api/hr.api';
import { departmentsApi, type Department } from '../../../api/departments.api';
import {
  ClassicWindow,
  CrudToolbar,
  StatusNote,
  ListPlaceholder,
  type WindowState,
} from '../../ui/ClassicWindow';
import { YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';
import { EmployeeDetailsTab } from './tabs/EmployeeDetailsTab';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

export interface EmployeeFormState {
  employeeNumber: string;
  name: string;
  fatherName: string;
  employeeCategoryId: string;
  gradeId: string;
  gender: string;
  currentShiftId: string;
  positionId: string;
  departmentId: string;
  sectionType: string;
  dateOfBirth: string;
  nationality: string;
  homePhone: string;
  phone: string;
  mobilePhone2: string;
  email: string;
  dateOfJoining: string;
  originalDateOfBirth: string;
  insurancePolicyNo: string;
  pfNo: string;
  otherInfo: string;
  fuelLiters: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  pinCode: string;
  state: string;
  status: string;
  serialNo: string;
  locationProjectSite: string;
  esiNo: string;
}

const emptyForm: EmployeeFormState = {
  employeeNumber: '', name: '', fatherName: '', employeeCategoryId: '', gradeId: '', gender: 'Male',
  currentShiftId: '', positionId: '', departmentId: '', sectionType: '', dateOfBirth: '', nationality: '',
  homePhone: '', phone: '', mobilePhone2: '', email: '', dateOfJoining: '', originalDateOfBirth: '',
  insurancePolicyNo: '', pfNo: '', otherInfo: '', fuelLiters: '', address1: '', address2: '', address3: '',
  city: '', pinCode: '', state: '', status: 'ACTIVE', serialNo: '', locationProjectSite: '', esiNo: '',
};

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');

function employeeToForm(e: Employee): EmployeeFormState {
  const cf = (e.customFields ?? {}) as Record<string, unknown>;
  return {
    employeeNumber: e.employeeNumber ?? '',
    name: e.name ?? '',
    fatherName: e.fatherName ?? '',
    employeeCategoryId: e.employeeCategoryId ?? '',
    gradeId: e.gradeId ?? '',
    gender: e.gender ?? 'Male',
    currentShiftId: e.currentShiftId ?? '',
    positionId: e.positionId ?? '',
    departmentId: e.departmentId ?? '',
    sectionType: e.sectionType ?? '',
    dateOfBirth: toDateInput(e.dateOfBirth),
    nationality: e.nationality ?? '',
    homePhone: typeof cf.homePhone === 'string' ? cf.homePhone : '',
    phone: e.phone ?? '',
    mobilePhone2: e.mobilePhone2 ?? '',
    email: e.email ?? '',
    dateOfJoining: toDateInput(e.dateOfJoining),
    originalDateOfBirth: toDateInput(e.originalDateOfBirth),
    insurancePolicyNo: e.insurancePolicyNo ?? '',
    pfNo: e.pfNo ?? '',
    otherInfo: e.otherInfo ?? '',
    fuelLiters: e.fuelLiters != null ? String(e.fuelLiters) : '',
    address1: e.address1 ?? '',
    address2: e.address2 ?? '',
    address3: e.address3 ?? '',
    city: e.city ?? '',
    pinCode: e.pinCode ?? '',
    state: e.state ?? '',
    status: e.status,
    serialNo: typeof cf.serialNo === 'string' ? cf.serialNo : '',
    locationProjectSite: e.locationProjectSite ?? '',
    esiNo: e.esiNo ?? '',
  };
}

function formToPayload(f: EmployeeFormState): EmployeePayload {
  return {
    employeeNumber: f.employeeNumber.trim() || undefined,
    name: f.name.trim(),
    fatherName: f.fatherName.trim() || undefined,
    employeeCategoryId: f.employeeCategoryId || undefined,
    gradeId: f.gradeId || undefined,
    gender: f.gender || undefined,
    currentShiftId: f.currentShiftId || undefined,
    positionId: f.positionId || undefined,
    departmentId: f.departmentId || undefined,
    sectionType: f.sectionType.trim() || undefined,
    dateOfBirth: f.dateOfBirth || undefined,
    nationality: f.nationality.trim() || undefined,
    phone: f.phone.trim() || undefined,
    mobilePhone2: f.mobilePhone2.trim() || undefined,
    email: f.email.trim() || undefined,
    dateOfJoining: f.dateOfJoining || undefined,
    originalDateOfBirth: f.originalDateOfBirth || undefined,
    insurancePolicyNo: f.insurancePolicyNo.trim() || undefined,
    pfNo: f.pfNo.trim() || undefined,
    otherInfo: f.otherInfo.trim() || undefined,
    fuelLiters: f.fuelLiters === '' ? undefined : Number(f.fuelLiters),
    address1: f.address1.trim() || undefined,
    address2: f.address2.trim() || undefined,
    address3: f.address3.trim() || undefined,
    city: f.city.trim() || undefined,
    pinCode: f.pinCode.trim() || undefined,
    state: f.state.trim() || undefined,
    status: f.status as EmployeePayload['status'],
    locationProjectSite: f.locationProjectSite.trim() || undefined,
    esiNo: f.esiNo.trim() || undefined,
    customFields: { homePhone: f.homePhone.trim() || undefined, serialNo: f.serialNo.trim() || undefined },
  };
}

export const EmployeeCurrentInformationWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [activeTab, setActiveTab] = useState<'Employee Details' | 'Leave Details'>('Employee Details');
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);

  const [categories, setCategories] = useState<EmployeeCategory[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [leaveBalances, setLeaveBalances] = useState<Awaited<ReturnType<typeof leaveBalancesApi.forEmployee>>>([]);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState('');

  const crud = useCrudResource<Employee, EmployeePayload>(
    'employees',
    employeesCrudApi,
    { label: (e) => e.name },
  );

  useEffect(() => {
    if (!show) return;
    employeeCategoriesApi.getAll({ isActive: true }).then(setCategories).catch(() => setCategories([]));
    gradesApi.getAll({ isActive: true }).then(setGrades).catch(() => setGrades([]));
    shiftsApi.getAll().then(setShifts).catch(() => setShifts([]));
    positionsApi.getAll().then(setPositions).catch(() => setPositions([]));
    departmentsApi.getAll().then(setDepartments).catch(() => setDepartments([]));
  }, [show]);

  useEffect(() => {
    if (crud.mode === 'new') setForm(emptyForm);
    else if (crud.mode === 'edit' && crud.selected) setForm(employeeToForm(crud.selected));
  }, [crud.mode, crud.selected]);

  useEffect(() => {
    if (activeTab !== 'Leave Details' || !crud.selected) return;
    setLeaveLoading(true);
    setLeaveError('');
    leaveBalancesApi.forEmployee(crud.selected.id)
      .then(setLeaveBalances)
      .catch((e) => setLeaveError(e instanceof Error ? e.message : 'Failed to load leave balances.'))
      .finally(() => setLeaveLoading(false));
  }, [activeTab, crud.selected]);

  if (!show || windowState.isMinimized) return null;

  const handleSave = () => {
    if (!form.name.trim()) {
      crud.setError('Employee Name is required.');
      return;
    }
    if (!form.employeeNumber.trim()) {
      crud.setError('Employee Code is required.');
      return;
    }
    crud.save(formToPayload(form));
  };

  const isForm = crud.mode === 'new' || crud.mode === 'edit';

  return (
    <ClassicWindow
      title="Employee Current Information"
      icon={<UserSquare2 className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={1000}
      minHeight={640}
      toolbar={
        <>
          <CrudToolbar
            onNew={crud.openNew}
            onEdit={() => crud.selected && crud.openEdit(crud.selected)}
            onDelete={() => crud.remove()}
            onRefresh={crud.refetch}
            canEdit={!!crud.selected}
            canDelete={!!crud.selected}
            isFetching={crud.isFetching}
            isBusy={crud.isBusy}
          />
          <StatusNote error={crud.error} status={crud.status} />
        </>
      }
      footer={
        <>
          <span>{crud.rows.length} employee{crud.rows.length === 1 ? '' : 's'}</span>
          <span>Employee Current Information</span>
        </>
      }
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-[240px] shrink-0 bg-white overflow-auto custom-scrollbar border-r border-[#d4d0c8]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Code</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Name</th>
              </tr>
            </thead>
            <tbody>
              {crud.rows.map((e, i) => (
                <tr
                  key={e.id}
                  onClick={() => crud.select(e)}
                  onDoubleClick={() => crud.openEdit(e)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    crud.selected?.id === e.id
                      ? 'bg-[#ffed99]'
                      : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] font-mono">{e.employeeNumber || '—'}</td>
                  <td className="py-1 px-2 truncate">{e.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder
            noCompany={crud.noCompany}
            isLoading={crud.isLoading}
            isEmpty={!crud.isLoading && crud.rows.length === 0}
            emptyText="No employees yet. Click New to add one."
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {!isForm && !crud.selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select an employee, or click New.</div>
          )}

          {(isForm || crud.selected) && (
            <>
              <div className="flex px-2 border-b border-gray-400 shrink-0 h-[26px] bg-[#ececec]">
                {(['Employee Details', 'Leave Details'] as const).map((tab) => (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-6 flex items-center justify-center cursor-pointer border border-gray-400 border-b-0 rounded-t-[4px] text-[11px] mr-[2px]',
                      activeTab === tab ? 'bg-white font-bold z-10 -mb-[1px] h-[27px]' : 'bg-[#d8d8d8] mt-[2.5px] h-[24px] hover:bg-[#e0e0e0] text-gray-700',
                    )}
                  >
                    {tab}
                  </div>
                ))}
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar bg-white">
                {activeTab === 'Employee Details' && (
                  <EmployeeDetailsTab
                    form={form}
                    onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                    categories={categories}
                    grades={grades}
                    shifts={shifts}
                    positions={positions}
                    departments={departments}
                    disabled={!isForm}
                  />
                )}
                {activeTab === 'Leave Details' && (
                  <div className="p-4">
                    {!crud.selected ? (
                      <div className="text-[10.5px] text-gray-400">Select an employee to view leave balances.</div>
                    ) : leaveLoading ? (
                      <div className="text-[10.5px] text-gray-400">Loading…</div>
                    ) : leaveError ? (
                      <div className="text-[10.5px] text-red-600">{leaveError}</div>
                    ) : (
                      <table className="w-full border-collapse text-[10.5px] border border-[#d4d0c8]">
                        <thead>
                          <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                            <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold">Leave Type</th>
                            <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold">Period</th>
                            <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold">Accrued</th>
                            <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold">Used</th>
                            <th className="text-right py-1 px-2 border-r border-[#d4d0c8] font-bold">Pending</th>
                            <th className="text-right py-1 px-2 font-bold">Carry Over</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveBalances.map((b) => (
                            <tr key={b.id} className="border-b border-[#f0f0f0]">
                              <td className="py-1 px-2 border-r border-[#f0f0f0]">{b.leaveType.name}</td>
                              <td className="py-1 px-2 border-r border-[#f0f0f0]">{b.periodKey}</td>
                              <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{Number(b.accruedDays).toFixed(2)}</td>
                              <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{Number(b.usedDays).toFixed(2)}</td>
                              <td className="py-1 px-2 border-r border-[#f0f0f0] text-right">{Number(b.pendingDays).toFixed(2)}</td>
                              <td className="py-1 px-2 text-right">{Number(b.carryOverDays).toFixed(2)}</td>
                            </tr>
                          ))}
                          {!leaveBalances.length && (
                            <tr><td colSpan={6} className="text-center text-gray-400 py-3">No leave balances recorded for this employee.</td></tr>
                          )}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>

              {isForm && (
                <div className="flex gap-2 p-2 border-t border-gray-400 shrink-0 bg-[#ececec]">
                  <YellowBtn onClick={handleSave} disabled={crud.isBusy}>
                    {crud.isBusy ? 'Saving…' : crud.mode === 'new' ? 'Add' : 'Save'}
                  </YellowBtn>
                  <GreyBtn onClick={crud.cancel}>Cancel</GreyBtn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
