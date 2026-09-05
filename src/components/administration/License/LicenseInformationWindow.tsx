import React from 'react';
import { BadgeInfo, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { licenseApi } from '../../../api/administration.api';
import {
  ClassicWindow,
  ToolBtn,
  type WindowState,
} from '../../ui/ClassicWindow';
import { cn, GreyBtn } from '../../ui/ClassicERPUI';

interface Props {
  show?: boolean;
  onClose: () => void;
  windowState: WindowState;
  setWindowState?: React.Dispatch<React.SetStateAction<WindowState>>;
  onUpdateState?: (patch: Partial<WindowState>) => void;
  onFocus?: () => void;
}

const date = (v?: string | null) => (v ? new Date(v).toLocaleDateString() : '—');

export const LicenseInformationWindow: React.FC<Props> = ({
  show = true, onClose, windowState, setWindowState, onUpdateState, onFocus,
}) => {
  const { activeCompanyId } = useAuth();
  const companyId = activeCompanyId;

  const infoQuery = useQuery({
    queryKey: ['license-information', companyId],
    queryFn: () => licenseApi.information(),
    enabled: !!companyId,
  });

  const info = infoQuery.data;
  const expiringSoon = info?.daysRemaining != null && info.daysRemaining <= 30;

  const Row: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-[200px_1fr] items-center gap-2 py-0.5 border-b border-[#f0f0f0]">
      <span className="text-[11px] text-gray-700">{label}</span>
      <span className="text-[11px]">{value}</span>
    </div>
  );

  return (
    <ClassicWindow
      title="License Information"
      icon={<BadgeInfo className="w-3.5 h-3.5 text-gray-600" />}
      show={show}
      onClose={onClose}
      onFocus={onFocus}
      windowState={windowState}
      setWindowState={setWindowState}
      onUpdateState={onUpdateState}
      minWidth={680}
      minHeight={440}
      toolbar={
        <ToolBtn onClick={() => infoQuery.refetch()} title="Refresh">
          <RefreshCw className={cn('w-3 h-3', infoQuery.isFetching && 'animate-spin')} /> Refresh
        </ToolBtn>
      }
      footer={
        <>
          <span>
            {info ? `${info.usedSeats} of ${info.totalSeats} seat(s) in use` : '—'}
          </span>
          <span>License Information</span>
        </>
      }
    >
      <div className="flex-1 min-h-0 overflow-auto bg-white p-3 custom-scrollbar">
        {!companyId ? (
          <div className="text-[10px] text-gray-500 italic">
            No company selected. Open{' '}
            <span className="font-medium not-italic">Administration → Choose Company</span> first.
          </div>
        ) : infoQuery.isLoading ? (
          <div className="text-[10.5px] text-gray-400">Loading…</div>
        ) : !info?.license ? (
          <div className="text-[10.5px] text-gray-500">
            No license has been imported for this company. Open License Administration and use
            Import License File.
          </div>
        ) : (
          <div className="max-w-[640px] space-y-3">
            <div>
              <div className="text-[11px] font-bold mb-1">License</div>
              <Row label="License Key" value={<span className="font-mono">{info.license.licenseKey}</span>} />
              <Row label="License Server" value={info.license.licenseServer ?? '—'} />
              <Row label="Port" value={info.license.port ?? '—'} />
              <Row label="Hardware Key" value={<span className="font-mono">{info.license.hardwareKey ?? '—'}</span>} />
              <Row label="Installation Number" value={info.license.installationNumber ?? '—'} />
              <Row label="System Number" value={info.license.systemNumber ?? '—'} />
              <Row label="Valid From" value={date(info.license.validFrom)} />
              <Row
                label="Valid To"
                value={
                  <span className={cn(expiringSoon && 'text-red-700 font-bold')}>
                    {date(info.expiresAt)}
                    {info.daysRemaining != null && (
                      <span className="ml-1">
                        ({info.daysRemaining < 0
                          ? `expired ${Math.abs(info.daysRemaining)} day(s) ago`
                          : `${info.daysRemaining} day(s) left`})
                      </span>
                    )}
                  </span>
                }
              />
              <Row label="Imported" value={new Date(info.license.importedAt).toLocaleString()} />
            </div>

            <div>
              <div className="text-[11px] font-bold mb-1">Seats</div>
              <table className="w-full border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-[#f0f0f0] border-b border-[#d4d0c8] text-left">
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444]">Component</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Total</th>
                    <th className="px-2 py-1 border-r border-[#d4d0c8] font-bold text-[#444] text-right">Used</th>
                    <th className="px-2 py-1 font-bold text-[#444] text-right">Available</th>
                  </tr>
                </thead>
                <tbody>
                  {info.components.map((c) => (
                    <tr key={c.id} className="border-b border-[#f0f0f0]">
                      <td className="px-2 py-1 border-r border-[#f0f0f0]">
                        <span className="font-mono">{c.code}</span>
                        <span className="text-gray-500"> — {c.name}</span>
                      </td>
                      <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{c.totalCount}</td>
                      <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{c.used}</td>
                      <td className={cn(
                        'px-2 py-1 text-right font-bold',
                        c.available === 0 && 'text-red-700',
                      )}>
                        {c.available}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[#f7f7f7] font-bold">
                    <td className="px-2 py-1 border-r border-[#f0f0f0]">Total</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{info.totalSeats}</td>
                    <td className="px-2 py-1 border-r border-[#f0f0f0] text-right">{info.usedSeats}</td>
                    <td className="px-2 py-1 text-right">{info.availableSeats}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {expiringSoon && (
              <div className="bg-red-50 border border-red-300 p-2 text-[10.5px] text-red-800">
                This license expires within 30 days. Once it lapses, its seats can no longer be
                assigned.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#d4d0c8] bg-[#f0f0f0] px-3 py-2 flex items-center gap-2">
        <GreyBtn onClick={onClose}>Close</GreyBtn>
      </div>
    </ClassicWindow>
  );
};
