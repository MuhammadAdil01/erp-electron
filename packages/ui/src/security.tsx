import { checkPassword, type PasswordContext, type PasswordRule } from '@erp/contracts';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Button } from './Button';
import type { ChecklistItem } from './forms';
import { color, radii, space } from './tokens';

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
  size = 192,
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
  return src ? (
    <img src={src} alt={label} width={size} height={size} style={{ borderRadius: radii.md }} />
  ) : (
    <div style={{ width: size, height: size }} aria-busy="true" />
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
    <section
      aria-labelledby="recovery-codes-title"
      style={{ display: 'flex', flexDirection: 'column', gap: space(3) }}
    >
      <h3 id="recovery-codes-title" style={{ margin: 0 }}>
        {labels.title}
      </h3>
      <p style={{ margin: 0 }}>{labels.intro}</p>
      <ol
        data-testid="recovery-codes"
        style={{
          fontFamily: 'ui-monospace, Consolas, monospace',
          background: color('surface'),
          padding: space(4),
          borderRadius: radii.md,
          columns: 2,
          margin: 0,
          direction: 'ltr',
        }}
      >
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>
      <div style={{ display: 'flex', gap: space(2), flexWrap: 'wrap' }}>
        <Button onClick={() => void navigator.clipboard?.writeText(text)}>{labels.copy}</Button>
        <Button onClick={download}>{labels.download}</Button>
      </div>
      <label style={{ display: 'flex', gap: space(2), alignItems: 'center' }}>
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        {labels.saved}
      </label>
      <Button disabled={!saved} onClick={onDone}>
        {labels.done}
      </Button>
    </section>
  );
}
