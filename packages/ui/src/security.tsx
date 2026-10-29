import { checkPassword, type PasswordContext, type PasswordRule } from '@erp/contracts';
import { Copy, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import { Checkbox, type ChecklistItem } from './forms';

// Pieces of the sign-in and account-security screens shared by the web app and the Platform
// Console (Part 05 §5.3.1, §5.3.9). Text comes from the app.

/** The live checklist for a new password; the server adds the common-password check. */
export function passwordChecklist(
  password: string,
  context: PasswordContext,
  label: (rule: PasswordRule) => string,
): ChecklistItem[] {
  return checkPassword(password, context)
    .filter((rule) => rule.key !== 'max_length' || !rule.ok)
    .map((rule) => ({ key: rule.key, ok: rule.ok, label: label(rule) }));
}

/** An authenticator's QR code, drawn locally: the secret never leaves the page. */
export function QrCode({
  value,
  label,
  size = 176,
}: {
  value: string;
  label: string;
  size?: number;
}) {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    let live = true;
    void QRCode.toDataURL(value, { margin: 1, width: size }).then((url) => live && setSrc(url));
    return () => {
      live = false;
    };
  }, [value, size]);
  return (
    <div className="inline-flex rounded-lg border border-line bg-white p-2 shadow-1">
      {src ? (
        <img src={src} alt={label} width={size} height={size} />
      ) : (
        <div style={{ width: size, height: size }} aria-busy="true" />
      )}
    </div>
  );
}

export type RecoveryCodesLabels = {
  title: string;
  intro: string;
  copy: string;
  download: string;
  saved: string;
  done: string;
};

/** The recovery codes, shown once, with copy, download and "I have saved them". */
export function RecoveryCodes({
  codes,
  labels,
  onDone,
}: {
  codes: string[];
  labels: RecoveryCodesLabels;
  onDone: () => void;
}) {
  const [saved, setSaved] = useState(false);
  const text = codes.join('\n');
  const download = () => {
    const url = URL.createObjectURL(new Blob([`${text}\n`], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'erp-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <section aria-labelledby="recovery-codes-title" className="flex flex-col gap-4">
      <div>
        <h3 id="recovery-codes-title" className="m-0 text-base font-semibold text-fg">
          {labels.title}
        </h3>
        <p className="m-0 mt-1 text-sm text-muted">{labels.intro}</p>
      </div>
      <ol
        data-testid="recovery-codes"
        className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-1.5 rounded-lg border border-line bg-subtle px-5 py-4 font-mono text-sm text-fg"
      >
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          icon={<Copy aria-hidden className="size-4" />}
          onClick={() => void navigator.clipboard?.writeText(text)}
        >
          {labels.copy}
        </Button>
        <Button
          variant="secondary"
          icon={<Download aria-hidden className="size-4" />}
          onClick={download}
        >
          {labels.download}
        </Button>
      </div>
      <Checkbox checked={saved} onCheckedChange={setSaved} label={labels.saved} />
      <Button disabled={!saved} onClick={onDone}>
        {labels.done}
      </Button>
    </section>
  );
}
