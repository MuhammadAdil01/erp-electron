import React, { useCallback, useEffect, useState } from 'react';
import { Table2, Plus, Trash2, RefreshCw } from 'lucide-react';
import { gradesApi, type Grade, type GradePayScaleStage } from '../../../api/payroll-masters.api';
import { ClassicWindow, StatusNote, type WindowState } from '../../ui/ClassicWindow';
import { ClassicSel, YellowBtn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState: React.Dispatch<React.SetStateAction<WindowState>>;
  onFocus?: () => void;
}

const COLUMNS: { key: keyof GradePayScaleStage; label: string }[] = [
  { key: 'basicPay', label: 'Basic Pay' },
  { key: 'hra', label: 'HRA' },
  { key: 'utilityAllowance', label: 'Utility Allowance' },
  { key: 'medicalAllowance', label: 'Medical Allowance' },
  { key: 'conveyanceAllowance', label: 'Conveyance Allowance' },
  { key: 'adhoc2017', label: 'Adhoc 2017' },
  { key: 'adhoc2018', label: 'Adhoc 2018' },
];

const toNum = (v: string | number | null | undefined): number | undefined =>
  v === null || v === undefined || v === '' ? undefined : Number(v);

export const GradePayScaleWindow: React.FC<Props> = ({
  show, onClose, windowState, setWindowState, onFocus,
}) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [gradeId, setGradeId] = useState('');
  const [rows, setRows] = useState<GradePayScaleStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const loadGrades = useCallback(async () => {
    try {
      const list = await gradesApi.getAll({ isActive: true });
      setGrades(list);
      if (!gradeId && list.length) setGradeId(list[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load grades.');
    }
  }, [gradeId]);

  useEffect(() => {
    if (show) void loadGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const loadPayScale = useCallback(async (id: string) => {
    if (!id) { setRows([]); return; }
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const stages = await gradesApi.getPayScale(id);
      setRows(stages.length ? stages : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pay scale.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (gradeId) void loadPayScale(gradeId);
  }, [gradeId, loadPayScale]);

  if (!show) return null;

  const addRow = () => {
    const nextStage = rows.length ? Math.max(...rows.map((r) => r.stage)) + 1 : 1;
    setRows((r) => [...r, { stage: nextStage }]);
  };

  const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx));

  const updateCell = (idx: number, key: keyof GradePayScaleStage, value: string) => {
    setRows((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value === '' ? '' : Number(value) } : row)));
  };

  const handleSave = async () => {
    if (!gradeId) {
      setError('Select a grade first.');
      return;
    }
    setSaving(true);
    setError('');
    setStatus('');
    try {
      const payload = rows.map((r) => ({
        stage: Number(r.stage),
        basicPay: toNum(r.basicPay),
        hra: toNum(r.hra),
        utilityAllowance: toNum(r.utilityAllowance),
        medicalAllowance: toNum(r.medicalAllowance),
        conveyanceAllowance: toNum(r.conveyanceAllowance),
        adhoc2017: toNum(r.adhoc2017),
        adhoc2018: toNum(r.adhoc2018),
      }));
      const saved = await gradesApi.replacePayScale(gradeId, payload);
      setRows(saved);
      setStatus('Pay scale saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The server rejected that change.');
    } finally {
      setSaving(false);
    }
  };

  const selectedGrade = grades.find((g) => g.id === gradeId);

  return (
    <ClassicWindow
      title="Grade Pay Scale"
      icon={<Table2 className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      minWidth={860}
      minHeight={480}
      toolbar={
        <>
          <span className="text-[10.5px] text-[#333]">Grade</span>
          <ClassicSel value={gradeId} onChange={(e) => setGradeId(e.target.value)} className="w-[220px]">
            {!grades.length && <option value="">No grades — create one in Grade Master</option>}
            {grades.map((g) => (
              <option key={g.id} value={g.id}>{g.code} — {g.description}</option>
            ))}
          </ClassicSel>
          <button
            onClick={() => void loadPayScale(gradeId)}
            className="flex items-center gap-1 px-2 py-0.5 text-[10.5px] border border-[#d4d0c8] bg-white rounded-[1px] hover:bg-[#ffed99]"
            title="Refresh"
          >
            <RefreshCw className={loading ? 'w-3 h-3 animate-spin' : 'w-3 h-3'} />
          </button>
          <StatusNote error={error} status={status} />
        </>
      }
      footer={
        <>
          <span>{rows.length} stage{rows.length === 1 ? '' : 's'}</span>
          <span>Grade Pay Scale</span>
        </>
      }
    >
      <div className="flex-1 flex flex-col overflow-hidden p-2">
        {!gradeId ? (
          <div className="p-3 text-[10.5px] text-gray-400 italic">
            No grade selected. Create a grade in <span className="font-medium not-italic">Grade Master</span> first.
          </div>
        ) : (
          <div className="flex-1 border border-[#d4d0c8] overflow-auto custom-scrollbar bg-white">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-[#f0f0f0]">
                <tr className="border-b border-[#d4d0c8]">
                  <th className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1 min-w-[60px]">Stage</th>
                  {COLUMNS.map((c) => (
                    <th key={c.key} className="border-r border-[#d4d0c8] text-[10px] font-bold text-left px-1 py-1 min-w-[100px]">
                      {c.label}
                    </th>
                  ))}
                  <th className="text-[10px] font-bold text-left px-1 py-1 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-200 h-6">
                    <td className="border-r border-gray-200 px-1">
                      <input
                        type="number"
                        min={1}
                        value={row.stage}
                        onChange={(e) => setRows((r) => r.map((rr, i) => (i === idx ? { ...rr, stage: Number(e.target.value) } : rr)))}
                        className="w-full h-[18px] text-[10.5px] outline-none border-none"
                      />
                    </td>
                    {COLUMNS.map((c) => (
                      <td key={c.key} className="border-r border-gray-200 px-1">
                        <input
                          type="number"
                          step="0.01"
                          value={row[c.key] === null || row[c.key] === undefined ? '' : String(row[c.key])}
                          onChange={(e) => updateCell(idx, c.key, e.target.value)}
                          className="w-full h-[18px] text-[10.5px] outline-none border-none"
                        />
                      </td>
                    ))}
                    <td className="px-1 text-center">
                      <button onClick={() => removeRow(idx)} title="Remove row">
                        <Trash2 className="w-3 h-3 text-red-500 hover:text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && !loading && (
                  <tr>
                    <td colSpan={COLUMNS.length + 2} className="text-center text-[10.5px] text-gray-400 py-4">
                      No stages yet for {selectedGrade?.code ?? 'this grade'}. Click "Add Row".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={addRow}
            disabled={!gradeId}
            className="px-4 py-0.5 bg-gradient-to-b from-[#fff6d5] via-[#ffec99] to-[#ffd700]/60 border border-gray-500 text-[11px] font-bold shadow-sm hover:from-white active:bg-orange-200 rounded-[1px] transition-all disabled:opacity-40"
          >
            <span className="inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Add Row</span>
          </button>
          <div className="flex gap-2">
            <YellowBtn onClick={handleSave} disabled={!gradeId || saving}>
              {saving ? 'Saving…' : 'Save'}
            </YellowBtn>
            <GreyBtn onClick={onClose}>Cancel</GreyBtn>
          </div>
        </div>
      </div>
    </ClassicWindow>
  );
};
