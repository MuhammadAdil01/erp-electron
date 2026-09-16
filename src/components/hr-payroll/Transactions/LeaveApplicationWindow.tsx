import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, RefreshCw } from 'lucide-react';
import {
  leaveRequestsApi,
  leaveTypesApi,
  leaveBalancesApi,
  type LeaveRequest,
  type LeaveType,
} from '../../../api/hr.api';
import { employeesApi, type Employee } from '../../../api/employees.api';
import { ClassicWindow, StatusNote, ListPlaceholder, ToolBtn, type WindowState } from '../../ui/ClassicWindow';
import { ClassicInput, ClassicSel, FieldRow, YellowBtn, GreyBtn, cn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : '');
const daysBetween = (a: string, b: string) => {
  if (!a || !b) return '';
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86400000 + 1;
  return d > 0 ? String(d) : '';
};

const emptyForm = {
  employeeId: '',
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  days: '',
  leaveDurationType: 'Full',
  reason: '',
  signedBy: '',
  contactNo: '',
  preparedBy: '',
};

type Mode = 'view' | 'new';

export const LeaveApplicationWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [rows, setRows] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [mode, setMode] = useState<Mode>('view');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [approvedByName, setApprovedByName] = useState('');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [lastLeave, setLastLeave] = useState<LeaveRequest | null>(null);
  const [balanceLeave, setBalanceLeave] = useState<number | null>(null);

  const load = useCallback(() => {
    setIsFetching(true);
    leaveRequestsApi.list()
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load leave applications.'))
      .finally(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    if (!show) return;
    setIsLoading(true);
    load();
    setIsLoading(false);
    employeesApi.getAll({ pageSize: 200 }).then((r) => setEmployees(r.items)).catch(() => setEmployees([]));
    leaveTypesApi.getAll().then(setLeaveTypes).catch(() => setLeaveTypes([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Last leave + balance, whenever employee/leave-type selection changes in the form.
  useEffect(() => {
    if (!form.employeeId) { setLastLeave(null); setBalanceLeave(null); return; }
    leaveRequestsApi.list({ employeeId: form.employeeId }).then((all) => {
      const past = all
        .filter((r) => (r.status === 'APPROVED' || r.status === 'TAKEN') && (!selected || r.id !== selected.id))
        .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());
      setLastLeave(past[0] ?? null);
    }).catch(() => setLastLeave(null));
    if (form.leaveTypeId) {
      leaveBalancesApi.forEmployee(form.employeeId).then((balances) => {
        const b = balances.find((x) => x.leaveType.id === form.leaveTypeId);
        setBalanceLeave(b ? Number(b.accruedDays) - Number(b.usedDays) - Number(b.pendingDays) : null);
      }).catch(() => setBalanceLeave(null));
    } else {
      setBalanceLeave(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.employeeId, form.leaveTypeId]);

  if (!show || windowState.isMinimized) return null;

  const openNew = () => {
    setSelected(null);
    setMode('new');
    setForm(emptyForm);
    setError(''); setStatus('');
  };

  const selectRow = (r: LeaveRequest) => {
    setSelected(r);
    setMode('view');
    setApprovedByName('');
    setError(''); setStatus('');
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.leaveTypeId || !form.startDate || !form.endDate) {
      setError('Employee, Leave Code, From Date and To Date are required.');
      return;
    }
    const days = form.days === '' ? Number(daysBetween(form.startDate, form.endDate) || '0') : Number(form.days);
    if (!days || days <= 0) {
      setError('No. of Days Leave Requested must be greater than 0.');
      return;
    }
    setIsBusy(true);
    setError('');
    try {
      const created = await leaveRequestsApi.submit(form.employeeId, {
        leaveTypeId: form.leaveTypeId,
        startDate: form.startDate,
        endDate: form.endDate,
        days,
        reason: form.reason.trim() || undefined,
        leaveDurationType: form.leaveDurationType,
        signedBy: form.signedBy.trim() || undefined,
        contactNo: form.contactNo.trim() || undefined,
        preparedBy: form.preparedBy.trim() || undefined,
      });
      load();
      setSelected(created);
      setMode('view');
      setStatus('Leave application submitted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The server rejected that application.');
    } finally {
      setIsBusy(false);
    }
  };

  const decide = async (action: 'approve' | 'reject' | 'cancel') => {
    if (!selected) return;
    setIsBusy(true);
    setError('');
    try {
      const updated = action === 'approve'
        ? await leaveRequestsApi.approve(selected.id, { approvedByName: approvedByName.trim() || undefined })
        : action === 'reject'
          ? await leaveRequestsApi.reject(selected.id)
          : await leaveRequestsApi.cancel(selected.id);
      setSelected(updated);
      load();
      setStatus(action === 'approve' ? 'Approved.' : action === 'reject' ? 'Rejected.' : 'Cancelled.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That action was rejected by the server.');
    } finally {
      setIsBusy(false);
    }
  };

  const employeeName = (id: string) => employees.find((e) => e.id === id)?.name ?? '—';
  const selectedEmployee = employees.find((e) => e.id === form.employeeId);

  return (
    <ClassicWindow
      title="Leave Application"
      icon={<CalendarClock className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={960}
      minHeight={640}
      toolbar={
        <>
          <ToolBtn onClick={openNew} disabled={isBusy}>New</ToolBtn>
          <ToolBtn onClick={load} title="Refresh"><RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} /></ToolBtn>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={<><span>{rows.length} application{rows.length === 1 ? '' : 's'}</span><span>Leave Application</span></>}
    >
      <div className="flex flex-1 min-h-0">
        <div className="w-[320px] shrink-0 bg-white overflow-auto custom-scrollbar border-r border-[#d4d0c8]">
          <table className="w-full border-collapse text-[10.5px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8]">
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Employee</th>
                <th className="text-left py-1 px-2 border-r border-[#d4d0c8] font-bold text-[#444]">Dates</th>
                <th className="text-left py-1 px-2 font-bold text-[#444]">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  onClick={() => selectRow(r)}
                  className={cn(
                    'border-b border-[#f0f0f0] cursor-default',
                    selected?.id === r.id ? 'bg-[#ffed99]' : i % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-[#fafafa] hover:bg-blue-50/50',
                  )}
                >
                  <td className="py-1 px-2 border-r border-[#f0f0f0] truncate">{r.employee?.name ?? employeeName(r.employeeId)}</td>
                  <td className="py-1 px-2 border-r border-[#f0f0f0]">{toDateInput(r.startDate)} → {toDateInput(r.endDate)}</td>
                  <td className="py-1 px-2">
                    <span className={cn(
                      r.status === 'APPROVED' || r.status === 'TAKEN' ? 'text-green-700'
                        : r.status === 'REJECTED' || r.status === 'CANCELLED' ? 'text-red-600'
                        : 'text-gray-600',
                    )}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ListPlaceholder isLoading={isLoading} isEmpty={!isLoading && rows.length === 0} emptyText="No leave applications yet. Click New to add one." />
        </div>

        <div className="flex-1 bg-white p-3 overflow-auto custom-scrollbar">
          {mode === 'view' && !selected && (
            <div className="text-[10.5px] text-gray-400 mt-6 text-center">Select an application, or click New.</div>
          )}

          {mode === 'view' && selected && (
            <div className="text-[10.5px] text-[#333]">
              <div className="font-bold text-[11px] mb-2">{selected.employee?.name ?? employeeName(selected.employeeId)} — {selected.leaveType?.name}</div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 max-w-[640px]">
                <FieldRow label="From" labelWidth="150px">{toDateInput(selected.startDate)}</FieldRow>
                <FieldRow label="To" labelWidth="150px">{toDateInput(selected.endDate)}</FieldRow>
                <FieldRow label="Days" labelWidth="150px">{selected.days}</FieldRow>
                <FieldRow label="Duration Type" labelWidth="150px">{selected.leaveDurationType ?? 'Full'}</FieldRow>
                <FieldRow label="Signed By" labelWidth="150px">{selected.signedBy || '—'}</FieldRow>
                <FieldRow label="Contact No." labelWidth="150px">{selected.contactNo || '—'}</FieldRow>
                <FieldRow label="Prepared By" labelWidth="150px">{selected.preparedBy || '—'}</FieldRow>
                <FieldRow label="Status" labelWidth="150px">{selected.status}</FieldRow>
                {selected.approvedByName && <FieldRow label="Approved By" labelWidth="150px">{selected.approvedByName}</FieldRow>}
                {selected.rejectedReason && <FieldRow label="Rejected Reason" labelWidth="150px">{selected.rejectedReason}</FieldRow>}
              </div>
              {selected.reason && (
                <div className="mt-3">
                  <div className="text-[10.5px] font-bold text-gray-700 mb-1">Notes</div>
                  <div className="whitespace-pre-wrap text-gray-700 border border-[#e0e0e0] p-2 bg-[#fafafa] max-w-[640px]">{selected.reason}</div>
                </div>
              )}

              {selected.status === 'PENDING' && (
                <div className="mt-4 p-2 bg-gray-100/50 border border-dotted border-gray-400 rounded-[2px] max-w-[500px]">
                  <span className="text-[11px] font-bold text-gray-700 italic block mb-2 underline">Office Use</span>
                  <FieldRow label="Approved By DO / GM" labelWidth="150px">
                    <ClassicInput value={approvedByName} onChange={(e) => setApprovedByName(e.target.value)} className="w-full" />
                  </FieldRow>
                  <div className="flex gap-2 mt-3">
                    <YellowBtn onClick={() => decide('approve')} disabled={isBusy}>Approve</YellowBtn>
                    <YellowBtn onClick={() => decide('reject')} disabled={isBusy}>Reject</YellowBtn>
                    <GreyBtn onClick={() => decide('cancel')} disabled={isBusy}>Cancel Application</GreyBtn>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'new' && (
            <div className="max-w-[720px]">
              <div className="grid grid-cols-2 gap-x-10 gap-y-1.5">
                <div className="flex flex-col gap-1.5">
                  <FieldRow label="Employee" required labelWidth="150px">
                    <ClassicSel value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} className="w-full">
                      <option value="">—</option>
                      {employees.map((e) => <option key={e.id} value={e.id}>{e.employeeNumber ? `${e.employeeNumber} — ` : ''}{e.name}</option>)}
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="Designation" labelWidth="150px">{selectedEmployee?.position || '—'}</FieldRow>
                  <FieldRow label="Last Leave From" labelWidth="150px">{lastLeave ? toDateInput(lastLeave.startDate) : '—'}</FieldRow>
                  <FieldRow label="Last Leave To" labelWidth="150px">{lastLeave ? toDateInput(lastLeave.endDate) : '—'}</FieldRow>
                  <FieldRow label="Leave Code" required labelWidth="150px">
                    <ClassicSel value={form.leaveTypeId} onChange={(e) => setForm((f) => ({ ...f, leaveTypeId: e.target.value }))} className="w-full">
                      <option value="">—</option>
                      {leaveTypes.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="From Date" required labelWidth="150px">
                    <ClassicInput type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value, days: daysBetween(e.target.value, f.endDate) }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="To Date" required labelWidth="150px">
                    <ClassicInput type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value, days: daysBetween(f.startDate, e.target.value) }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="No. Of Days" labelWidth="150px">
                    <ClassicInput type="number" step="0.5" min="0.5" value={form.days} onChange={(e) => setForm((f) => ({ ...f, days: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Balance Leave" labelWidth="150px">{balanceLeave != null ? balanceLeave.toFixed(1) : '—'}</FieldRow>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FieldRow label="Leave Type" labelWidth="150px">
                    <ClassicSel value={form.leaveDurationType} onChange={(e) => setForm((f) => ({ ...f, leaveDurationType: e.target.value }))} className="w-full">
                      <option value="Full">Full</option>
                      <option value="Half">Half</option>
                    </ClassicSel>
                  </FieldRow>
                  <FieldRow label="DOJ" labelWidth="150px">{selectedEmployee?.hireDate ? toDateInput(selectedEmployee.hireDate) : '—'}</FieldRow>
                  <FieldRow label="Signed By" labelWidth="150px">
                    <ClassicInput value={form.signedBy} onChange={(e) => setForm((f) => ({ ...f, signedBy: e.target.value }))} className="w-full" />
                  </FieldRow>
                  <FieldRow label="Contact No." labelWidth="150px">
                    <ClassicInput value={form.contactNo} onChange={(e) => setForm((f) => ({ ...f, contactNo: e.target.value }))} className="w-full" placeholder={selectedEmployee?.phone ?? ''} />
                  </FieldRow>
                  <FieldRow label="Prepared By" labelWidth="150px">
                    <ClassicInput value={form.preparedBy} onChange={(e) => setForm((f) => ({ ...f, preparedBy: e.target.value }))} className="w-full" />
                  </FieldRow>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[10.5px] text-[#333] mb-1">Notes</div>
                <textarea value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className="w-full h-16 border border-[#d4d0c8] p-1 text-[10.5px] outline-none focus:border-orange-400 bg-white resize-none" />
              </div>

              <div className="flex gap-2 mt-4">
                <YellowBtn onClick={handleSubmit} disabled={isBusy}>{isBusy ? 'Submitting…' : 'Submit'}</YellowBtn>
                <GreyBtn onClick={() => { setMode('view'); setError(''); }}>Cancel</GreyBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClassicWindow>
  );
};
