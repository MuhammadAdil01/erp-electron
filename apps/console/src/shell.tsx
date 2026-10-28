import type { StaffPermission } from '@erp/contracts';
import { Banner, Button, Dialog } from '@erp/ui';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, sdk } from './auth';
import { holds, useStaffAccess } from './staff-access';

// The console frame (Part 03 §3.3.2): title, Ctrl+K search, the staff member and sign-out on
// top; a sidebar with only the entries this person's roles may use, with badges for work
// waiting; the page on the right.

type SearchResult = Awaited<ReturnType<typeof sdk.console.search>>;

function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [found, setFound] = useState<{ q: string; result: SearchResult } | null>(null);
  const query = q.trim();
  useEffect(() => {
    if (!open || query.length < 2) return;
    const timer = setTimeout(() => {
      sdk.console.search(query).then(
        (result) => setFound({ q: query, result }),
        () => setFound(null),
      );
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open]);
  // Only the answer to what is typed now; nothing for one letter.
  const result = query.length >= 2 && found?.q === query ? found.result : null;
  const go = (path: string) => {
    onOpenChange(false);
    setQ('');
    void navigate({ to: path });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('console.shell.search')} closeLabel={t('common.close')}>
      <input
        autoFocus
        aria-label={t('console.shell.search')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-md border p-2"
        style={{ borderColor: 'var(--erp-color-border)' }}
      />
      {result && (
        <div className="mt-3 grid gap-3">
          {result.pages.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold">{t('console.shell.pages')}</h3>
              <ul>
                {result.pages.map((p) => (
                  <li key={p.path}>
                    <button type="button" className="w-full p-1 text-start underline" onClick={() => go(p.path)}>
                      {t(p.label)}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {result.tenants.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold">{t('console.shell.tenants')}</h3>
              <ul>
                {result.tenants.map((tn) => (
                  <li key={tn.id} className="p-1">
                    {tn.display_name} <span className="text-sm opacity-70">{tn.code} · {tn.slug} · {tn.status}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {result.pages.length + result.tenants.length === 0 && <p>{t('console.shell.no_results')}</p>}
        </div>
      )}
    </Dialog>
  );
}

/** The avatar menu: who is signed in, with which roles, the language, and sign-out. */
function AccountMenu() {
  const { t, i18n } = useTranslation();
  const access = useStaffAccess();
  const navigate = useNavigate();
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    sdk.staff.me().then(setMe, () => undefined);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  const initials = (me?.name ?? '?')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={t('console.shell.account')}
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full font-semibold"
        style={{ background: 'var(--erp-color-primary)', color: 'var(--erp-color-on-primary)' }}
      >
        {initials}
      </button>
      {open && (
        <div
          className="absolute end-0 z-10 mt-2 grid w-72 gap-2 rounded-md border p-3 shadow-lg"
          style={{ background: 'var(--erp-color-background)', borderColor: 'var(--erp-color-border)' }}
        >
          <strong>{me?.name}</strong>
          <span className="text-sm opacity-80">{me?.email}</span>
          <span className="text-sm" data-testid="console-roles">
            {access?.roles.map((r) => t(`console.role.${r}`)).join(', ')}
          </span>
          <button type="button" className="text-start underline" onClick={() => void i18n.changeLanguage(i18n.language === 'ur' ? 'en' : 'ur')}>
            {t('common.language')}
          </button>
          <Button
            onClick={() => {
              void auth()
                .signOut()
                .then(() => navigate({ to: '/signin' }));
            }}
          >
            {t('common.sign_out')}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const access = useStaffAccess();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [searching, setSearching] = useState(false);
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const badge = (entry: string) => (entry === '/approvals' ? (access?.badges.approvals ?? 0) : 0);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 border-b px-6 py-3" style={{ borderColor: 'var(--erp-color-border)' }}>
        <strong className="flex-1">{t('app.console_title')}</strong>
        <button
          type="button"
          onClick={() => setSearching(true)}
          className="rounded-md border px-3 py-1 text-start"
          style={{ borderColor: 'var(--erp-color-border)', minWidth: 260 }}
        >
          {t('console.shell.search')} <kbd className="text-xs opacity-70">{t('console.shell.search_hint')}</kbd>
        </button>
        <AccountMenu />
      </header>
      <div className="flex flex-1">
        <nav aria-label={t('console.nav.label')} className="w-60 border-e p-4" style={{ borderColor: 'var(--erp-color-border)' }}>
          {access?.menu.map((group) => (
            <div key={group.group} className="mb-4">
              <div className="mb-1 text-xs font-semibold uppercase opacity-70">{t(`console.nav.group_${group.group}`)}</div>
              <ul data-testid={`nav-${group.group}`}>
                {group.entries.map((entry) => (
                  <li key={entry.path}>
                    <Link
                      to={entry.path}
                      className="flex items-center justify-between rounded-md px-2 py-1"
                      style={path === entry.path ? { background: 'var(--erp-color-surface)', fontWeight: 600 } : undefined}
                    >
                      {t(entry.label)}
                      {badge(entry.path) > 0 && (
                        <span className="rounded-full px-2 text-xs" style={{ background: 'var(--erp-color-primary)', color: 'var(--erp-color-on-primary)' }}>
                          {badge(entry.path)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
      <CommandPalette open={searching} onOpenChange={setSearching} />
    </div>
  );
}

/** A page for staff holding one of these permissions; others see why not (the API refuses too). */
export function Guarded({ anyOf, children }: { anyOf: StaffPermission[]; children: ReactNode }) {
  const { t } = useTranslation();
  const access = useStaffAccess();
  if (!access) return <p aria-busy="true">{t('common.loading')}</p>;
  if (!holds(access, ...anyOf)) return <Banner tone="error">{t('access.no_access_title')}</Banner>;
  return <>{children}</>;
}
