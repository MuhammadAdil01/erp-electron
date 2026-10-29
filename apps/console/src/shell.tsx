import type { StaffPermission } from '@erp/contracts';
import {
  applyTheme,
  AppShell,
  AvatarButton,
  CommandPalette,
  currentTheme,
  EmptyState,
  IconButton,
  Logo,
  Menu,
  SearchButton,
  SideNav,
  Skeleton,
  TopBar,
  useCommandShortcut,
  type CommandItem,
  type NavGroup,
  type RenderLink,
} from '@erp/ui';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  BookOpenCheck,
  Building2,
  CircleHelp,
  ClipboardCheck,
  Globe2,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Moon,
  Package,
  ScrollText,
  Search,
  ShieldOff,
  Sun,
  Tags,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, sdk } from './auth';
import { holds, useStaffAccess } from './staff-access';

// The console frame (Part 03 §3.3.2): logo, Ctrl+K search over tenants and pages, help and the
// staff member's menu on top; a sidebar with only the entries this person's roles may use,
// with badges for work waiting; the page on the right.

type SearchResult = Awaited<ReturnType<typeof sdk.console.search>>;

const ICONS: Record<string, ReactNode> = {
  '/': <LayoutDashboard aria-hidden />,
  '/catalogue/modules': <Package aria-hidden />,
  '/catalogue/templates': <LayoutTemplate aria-hidden />,
  '/catalogue/plans': <Tags aria-hidden />,
  '/catalogue/country-packs': <Globe2 aria-hidden />,
  '/approvals': <ClipboardCheck aria-hidden />,
  '/audit': <ScrollText aria-hidden />,
  '/staff': <Users aria-hidden />,
};

const renderLink: RenderLink = ({ href, className, children, title, ...rest }) => (
  <Link to={href} className={className} title={title} aria-current={rest['aria-current']}>
    {children}
  </Link>
);

function useSearch(open: boolean, query: string): SearchResult | null {
  const [found, setFound] = useState<{ q: string; result: SearchResult } | null>(null);
  const q = query.trim();
  useEffect(() => {
    if (!open || q.length < 2) return;
    const timer = setTimeout(() => {
      sdk.console.search(q).then(
        (result) => setFound({ q, result }),
        () => setFound(null),
      );
    }, 200);
    return () => clearTimeout(timer);
  }, [q, open]);
  // Only the answer to what is typed now; nothing for one letter.
  return q.length >= 2 && found?.q === q ? found.result : null;
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const access = useStaffAccess();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState(() => currentTheme());
  const result = useSearch(searching, query);
  const openSearch = useCallback(() => setSearching(true), []);
  useCommandShortcut(openSearch);
  useEffect(() => {
    sdk.staff.me().then(setMe, () => undefined);
  }, []);

  const groups: NavGroup[] = (access?.menu ?? []).map((group) => ({
    key: group.group,
    label: t(`console.nav.group_${group.group}`),
    items: group.entries.map((entry) => ({
      key: entry.path,
      href: entry.path,
      label: t(entry.label),
      icon: ICONS[entry.path],
      badge: entry.path === '/approvals' ? access?.badges.approvals || undefined : undefined,
      active: entry.path === '/' ? path === '/' : path.startsWith(entry.path),
    })),
  }));

  const pages: CommandItem[] = groups
    .flatMap((g) => g.items)
    .filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()))
    .map((i) => ({
      key: i.key,
      label: i.label,
      icon: i.icon,
      onSelect: () => void navigate({ to: i.href }),
    }));
  const tenants: CommandItem[] = (result?.tenants ?? []).map((tn) => ({
    key: tn.id,
    label: tn.display_name,
    hint: `${tn.code} · ${tn.slug}`,
    icon: <Building2 aria-hidden />,
    onSelect: () => undefined,
  }));
  const chooseTheme = (next: 'light' | 'dark') => {
    applyTheme(next);
    setTheme(next);
  };
  const roles = access?.roles.map((r) => t(`console.role.${r}`)).join(', ');

  const topBar = (
    <TopBar
      start={
        <Link to="/" className="rounded-md no-underline" aria-label={t('app.console_title')}>
          <Logo name={t('app.tagline')} subtitle={t('app.console_subtitle')} />
        </Link>
      }
      center={
        <span className="hidden w-full justify-center md:flex">
          <SearchButton label={t('console.shell.search')} onClick={openSearch} />
        </span>
      }
      end={
        <>
          <IconButton label={t('shell.search_title')} className="md:hidden" onClick={openSearch}>
            <Search aria-hidden className="size-5" />
          </IconButton>
          <Menu
            trigger={
              <IconButton label={t('shell.help')}>
                <CircleHelp aria-hidden className="size-5" />
              </IconButton>
            }
            items={[
              {
                key: 'shortcuts',
                label: `${t('shell.shortcut_palette')} · Ctrl K`,
                icon: <BookOpenCheck aria-hidden />,
                onSelect: openSearch,
              },
            ]}
          />
          <Menu
            trigger={
              <AvatarButton
                name={me?.name ?? ''}
                label={t('console.shell.account')}
                className="ms-1"
              />
            }
            header={
              <div className="flex flex-col">
                <strong className="text-sm text-fg">{me?.name}</strong>
                <span className="text-xs text-muted">{me?.email}</span>
                <span className="mt-1 text-xs text-muted" data-testid="console-roles">
                  {roles}
                </span>
              </div>
            }
            items={[
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
                onSelect: () =>
                  void auth()
                    .signOut()
                    .then(() => navigate({ to: '/signin' })),
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
            label={t('console.nav.label')}
            collapsed={collapsed}
            renderLink={renderLink}
          />
        )}
        collapseLabel={t('shell.collapse')}
        expandLabel={t('shell.expand')}
      >
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
        groups={[
          { key: 'pages', label: t('console.shell.pages'), items: pages },
          { key: 'tenants', label: t('console.shell.tenants'), items: tenants },
        ]}
        title={t('shell.search_title')}
        placeholder={t('console.shell.search')}
        emptyLabel={t('console.shell.no_results')}
      />
    </>
  );
}

/** A page for staff holding one of these permissions; others see why not (the API refuses too). */
export function Guarded({ anyOf, children }: { anyOf: StaffPermission[]; children: ReactNode }) {
  const { t } = useTranslation();
  const access = useStaffAccess();
  if (!access) return <Skeleton lines={4} label={t('common.loading')} />;
  if (!holds(access, ...anyOf))
    return (
      <div className="mx-auto max-w-xl pt-10">
        <EmptyState
          icon={<ShieldOff aria-hidden className="size-5" />}
          title={t('access.no_access_title')}
        />
      </div>
    );
  return <>{children}</>;
}
