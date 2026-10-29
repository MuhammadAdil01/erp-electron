import {
  applyTheme,
  AppShell,
  AuthLayout,
  AvatarButton,
  Banner,
  BottomNav,
  CommandPalette,
  currentTheme,
  Dialog,
  IconButton,
  Logo,
  Menu,
  SearchButton,
  SideNav,
  SwitcherButton,
  TopBar,
  useCommandShortcut,
  type CommandItem,
  type NavGroup,
  type NavItem,
  type RenderLink,
} from '@erp/ui';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  Bell,
  Building2,
  CircleHelp,
  House,
  Keyboard,
  LogOut,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LIMITED_STATUSES, useAccess } from './access';
import { auth, sdk, useAuthState } from './auth';

// The company app's frame (Part 12 §12.2): top bar with the company switcher, search (Ctrl+K),
// notifications, help and the account menu; the sidebar from /me/access; the page. Only
// screens that exist are listed (§12.1 #2): a /me/access menu entry appears once its screen is
// built and added to BUILT below.

/** Paths of /me/access menu entries whose screens exist. */
const BUILT: ReadonlySet<string> = new Set<string>([]);

const renderLink: RenderLink = ({ href, className, children, title, ...rest }) => (
  <Link to={href} className={className} title={title} aria-current={rest['aria-current']}>
    {children}
  </Link>
);

function useNavGroups(path: string): NavGroup[] {
  const { t } = useTranslation();
  const access = useAccess();
  return useMemo(() => {
    const item = (key: string, href: string, label: string, icon: ReactNode): NavItem => ({
      key,
      href,
      label,
      icon,
      active: path === href,
    });
    const modules: NavGroup[] = (access?.menu ?? [])
      .map((g) => ({
        key: g.group,
        label: t(`nav.group.${g.group}`, { defaultValue: g.group }),
        items: g.entries
          .filter((e) => BUILT.has(e.path))
          .map((e) => item(e.path, e.path, t(e.label), null)),
      }))
      .filter((g) => g.items.length > 0);
    return [
      {
        key: 'workspace',
        label: t('shell.group_workspace'),
        items: [item('home', '/', t('nav.home'), <House aria-hidden />)],
      },
      ...modules,
      {
        key: 'account',
        label: t('shell.group_account'),
        items: [
          item('security', '/account/security', t('nav.security'), <ShieldCheck aria-hidden />),
        ],
      },
    ];
  }, [access, path, t]);
}

function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const rows: [string, string][] = [
    ['Ctrl K', t('shell.shortcut_palette')],
    ['Ctrl S', t('shell.shortcut_save')],
    ['Esc', t('shell.shortcut_close')],
  ];
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('shell.shortcuts')}
      closeLabel={t('common.close')}
    >
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
        {rows.map(([keys, what]) => (
          <div key={keys} className="contents">
            <dt>
              <kbd className="rounded-sm border border-line bg-subtle px-2 py-0.5 font-sans text-xs">
                {keys}
              </kbd>
            </dt>
            <dd className="m-0 text-fg">{what}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}

export function WebShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const state = useAuthState();
  const status = useAccess()?.tenant.status;
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const me = useQuery({ queryKey: ['me'], queryFn: () => sdk.me.get() });
  const groups = useNavGroups(path);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [shortcuts, setShortcuts] = useState(false);
  const [theme, setTheme] = useState(() => currentTheme());
  const openSearch = useCallback(() => setSearching(true), []);
  useCommandShortcut(openSearch);

  const signedIn = state.status === 'signed_in' ? state : null;
  const membership = signedIn?.membership ?? null;
  const memberships = signedIn?.memberships ?? [];
  const switchTo = (membershipId: string) =>
    void sdk.auth.switchCompany(membershipId).then((body) => {
      auth().accept(body);
      void navigate({ to: '/' });
    });
  const signOut = () =>
    void auth()
      .signOut()
      .then(() => navigate({ to: '/signin' }));
  const chooseTheme = (next: 'light' | 'dark') => {
    applyTheme(next);
    setTheme(next);
  };

  const pages: CommandItem[] = groups
    .flatMap((g) => g.items)
    .filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()))
    .map((i) => ({
      key: i.key,
      label: i.label,
      icon: i.icon,
      onSelect: () => void navigate({ to: i.href }),
    }));

  const company = membership ? (
    memberships.length > 1 ? (
      <Menu
        align="start"
        trigger={<SwitcherButton caption={t('shell.company')} value={membership.tenant_name} />}
        items={[
          { key: 'h', heading: t('shell.switch_company') },
          ...memberships.map((m) => ({
            key: m.membership_id,
            label: m.tenant_name,
            icon: <Building2 aria-hidden />,
            checked: m.membership_id === membership.membership_id,
            onSelect: () => switchTo(m.membership_id),
          })),
        ]}
      />
    ) : (
      <span className="hidden flex-col px-2.5 leading-tight sm:flex">
        <span className="text-[11px] text-muted">{t('shell.company')}</span>
        <span className="text-sm font-semibold text-fg">{membership.tenant_name}</span>
      </span>
    )
  ) : null;

  const topBar = (
    <TopBar
      start={
        <>
          <Link to="/" className="rounded-md no-underline" aria-label={t('app.title')}>
            <span className="hidden sm:inline">
              <Logo name={t('app.title')} />
            </span>
            <span className="sm:hidden">
              <Logo name={t('app.title')} compact />
            </span>
          </Link>
          {company && <span aria-hidden className="mx-1 hidden h-6 w-px bg-line sm:block" />}
          {company}
        </>
      }
      center={
        <span className="hidden w-full justify-center md:flex">
          <SearchButton label={t('shell.search')} onClick={openSearch} />
        </span>
      }
      end={
        <>
          <IconButton label={t('shell.search_title')} className="md:hidden" onClick={openSearch}>
            <Search aria-hidden className="size-5" />
          </IconButton>
          <Menu
            trigger={
              <IconButton label={t('shell.notifications')}>
                <Bell aria-hidden className="size-5" />
              </IconButton>
            }
            header={<strong className="text-sm">{t('shell.notifications')}</strong>}
            items={[{ key: 'none', heading: t('shell.no_notifications') }]}
          />
          <Menu
            trigger={
              <IconButton label={t('shell.help')}>
                <CircleHelp aria-hidden className="size-5" />
              </IconButton>
            }
            items={[
              {
                key: 'shortcuts',
                label: t('shell.shortcuts'),
                icon: <Keyboard aria-hidden />,
                onSelect: () => setShortcuts(true),
              },
            ]}
          />
          <Menu
            trigger={
              <AvatarButton
                name={me.data?.name ?? ''}
                label={t('shell.account')}
                className="ms-1"
              />
            }
            header={
              <div className="flex flex-col">
                <strong className="text-sm text-fg">{me.data?.name}</strong>
                <span className="text-xs text-muted">{me.data?.email}</span>
              </div>
            }
            items={[
              { key: 's0', separator: true },
              {
                key: 'account',
                label: t('shell.my_account'),
                icon: <UserRound aria-hidden />,
                onSelect: () => void navigate({ to: '/account/security' }),
              },
              { key: 's1', separator: true },
              { key: 'theme', heading: t('shell.theme') },
              {
                key: 'light',
                label: t('shell.theme_light'),
                icon: <Sun aria-hidden />,
                checked: theme === 'light',
                onSelect: () => chooseTheme('light'),
              },
              {
                key: 'dark',
                label: t('shell.theme_dark'),
                icon: <Moon aria-hidden />,
                checked: theme === 'dark',
                onSelect: () => chooseTheme('dark'),
              },
              { key: 's2', separator: true },
              {
                key: 'signout',
                label: t('common.sign_out'),
                icon: <LogOut aria-hidden />,
                onSelect: signOut,
              },
            ]}
          />
        </>
      }
    />
  );

  return (
    <>
      <AppShell
        topBar={topBar}
        nav={(collapsed) => (
          <SideNav
            groups={groups}
            label={t('shell.menu')}
            collapsed={collapsed}
            renderLink={renderLink}
          />
        )}
        bottomNav={
          <BottomNav
            label={t('shell.quick_nav')}
            renderLink={renderLink}
            items={[
              {
                key: 'home',
                href: '/',
                label: t('nav.home'),
                icon: <House aria-hidden />,
                active: path === '/',
              },
              {
                key: 'security',
                href: '/account/security',
                label: t('nav.security'),
                icon: <ShieldCheck aria-hidden />,
                active: path === '/account/security',
              },
            ]}
          />
        }
        collapseLabel={t('shell.collapse')}
        expandLabel={t('shell.expand')}
      >
        {status && LIMITED_STATUSES.includes(status) && (
          <div className="mb-6">
            <Banner
              tone={
                status === 'trial_expired' || status === 'suspended_read_only' ? 'warning' : 'error'
              }
            >
              {t(`access.status.${status}`)}
            </Banner>
          </div>
        )}
        {children}
      </AppShell>
      <CommandPalette
        open={searching}
        onOpenChange={(open) => {
          setSearching(open);
          if (!open) setQuery('');
        }}
        query={query}
        onQueryChange={setQuery}
        groups={[{ key: 'pages', label: t('shell.pages'), items: pages }]}
        title={t('shell.search_title')}
        placeholder={t('shell.search_placeholder')}
        emptyLabel={t('shell.no_results')}
      />
      <ShortcutsDialog open={shortcuts} onOpenChange={setShortcuts} />
    </>
  );
}

/** The centred card of the pages before and around sign-in. */
export function AuthPage({
  title,
  description,
  children,
  footer,
  wide,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <AuthLayout
      logo={<Logo name={t('app.title')} />}
      title={title}
      description={description}
      footer={footer}
      wide={wide}
    >
      {children}
    </AuthLayout>
  );
}

/** Pages for signed-in people only; others go to sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const state = useAuthState();
  if (state.status === 'loading')
    return (
      <p aria-busy="true" className="sr-only">
        {t('common.loading')}
      </p>
    );
  if (state.status === 'signed_out') return <Navigate to="/signin" />;
  return <>{children}</>;
}
