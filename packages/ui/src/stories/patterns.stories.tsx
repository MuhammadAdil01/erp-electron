import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Activity,
  Bell,
  Building2,
  CircleHelp,
  ClipboardCheck,
  Download,
  FileText,
  Globe2,
  House,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  Package,
  Plus,
  Receipt,
  ScrollText,
  ShoppingCart,
  Tags,
  TriangleAlert,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Button, IconButton } from '../Button';
import { DataGrid, FilterBar, FilterChip, type ColumnDef } from '../data-grid';
import { Input, PasswordInput } from '../forms';
import { Breadcrumbs, Card, KpiTile, Menu, PageHeader, StatusChip } from '../kit';
import {
  AppShell,
  AuthLayout,
  AvatarButton,
  Logo,
  SearchButton,
  SideNav,
  SwitcherButton,
  TopBar,
  type NavGroup,
} from '../shell';

// The page patterns of Part 12 §12.2–12.3 and Part 03 §3.3.2–3.4, §3.8.1 with sample data, as
// the screens will look once their data exists. Every name and number here is invented.

const meta: Meta = { title: 'Design system/Patterns', parameters: { layout: 'fullscreen' } };
export default meta;
type Story = StoryObj;

const SampleChip = () => (
  <span className="inline-flex h-6 items-center rounded-full border border-dashed border-line-strong px-2.5 text-xs font-medium text-muted">
    Sample data
  </span>
);

const labels = {
  columns: 'Columns',
  views: 'Saved views',
  saveView: 'Save view',
  viewName: 'View name',
  noRows: 'Nothing matches',
  density: 'Density',
};

// ── Company app ──────────────────────────────────────────────────────────────────────────────

const companyNav = (active: string): NavGroup[] => [
  {
    key: 'me',
    items: [
      { key: 'home', label: 'Home', href: '#', icon: <House />, active: active === 'home' },
      { key: 'approvals', label: 'My Approvals', href: '#', icon: <ListChecks />, badge: 3 },
      { key: 'tasks', label: 'My Tasks', href: '#', icon: <Inbox /> },
    ],
  },
  {
    key: 'modules',
    label: 'Modules',
    items: [
      { key: 'finance', label: 'Finance', href: '#', icon: <Wallet /> },
      {
        key: 'sales',
        label: 'Sales & CRM',
        href: '#',
        icon: <Receipt />,
        active: active === 'customers',
      },
      { key: 'purchasing', label: 'Purchasing', href: '#', icon: <ShoppingCart /> },
      { key: 'inventory', label: 'Inventory', href: '#', icon: <Warehouse /> },
      { key: 'people', label: 'People', href: '#', icon: <Users /> },
      { key: 'reports', label: 'Reports', href: '#', icon: <FileText /> },
    ],
  },
];

function CompanyShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <AppShell
      collapseLabel="Collapse"
      expandLabel="Expand the menu"
      nav={(collapsed) => (
        <SideNav groups={companyNav(active)} label="Main menu" collapsed={collapsed} />
      )}
      topBar={
        <TopBar
          start={
            <>
              <Logo name="ERP System" />
              <span aria-hidden className="mx-1 h-6 w-px bg-line" />
              <SwitcherButton caption="Company" value="Sample Trading Co." />
            </>
          }
          center={<SearchButton label="Search or jump to…" onClick={() => undefined} />}
          end={
            <>
              <Menu
                trigger={
                  <Button size="sm" icon={<Plus className="size-4" />}>
                    New
                  </Button>
                }
                items={[
                  { key: 'inv', label: 'Sales invoice', onSelect: () => undefined },
                  { key: 'cust', label: 'Customer', onSelect: () => undefined },
                ]}
              />
              <IconButton label="Notifications">
                <Bell className="size-5" />
              </IconButton>
              <IconButton label="Help">
                <CircleHelp className="size-5" />
              </IconButton>
              <AvatarButton name="Sana Malik" label="Your account" className="ms-1" />
            </>
          }
        />
      }
    >
      {children}
    </AppShell>
  );
}

type Customer = {
  id: string;
  name: string;
  code: string;
  city: string;
  balance: number;
  due: string;
  status: string;
};
const CUSTOMERS: Customer[] = [
  ['Sample Trading Co.', 'C-0001', 'Lahore', 245000, '12 Nov 2026', 'active'],
  ['Example Foods Ltd.', 'C-0002', 'Karachi', 0, '—', 'active'],
  ['Demo Textiles', 'C-0003', 'Faisalabad', 1250000, '02 Oct 2026', 'overdue'],
  ['Test Pharmacy', 'C-0004', 'Islamabad', 98000, '05 Nov 2026', 'due_soon'],
  ['Placeholder Motors', 'C-0005', 'Multan', 455500, '20 Nov 2026', 'active'],
  ['Mock Builders', 'C-0006', 'Rawalpindi', 72000, '30 Oct 2026', 'partially_paid'],
  ['Sample Schools Network', 'C-0007', 'Lahore', 0, '—', 'active'],
  ['Fictional Agro', 'C-0008', 'Sahiwal', 310000, '01 Oct 2026', 'overdue'],
].map(([name, code, city, balance, due, status], i) => ({
  id: String(i),
  name: name as string,
  code: code as string,
  city: city as string,
  balance: balance as number,
  due: due as string,
  status: status as string,
}));
const STATUS: Record<string, string> = {
  active: 'Active',
  overdue: 'Overdue',
  due_soon: 'Due soon',
  partially_paid: 'Partially paid',
};
const money = (n: number) => n.toLocaleString('en-PK', { minimumFractionDigits: 2 });

export const CompanyListPage: Story = {
  name: 'Company app · list page',
  render: function ListStory() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string | null>(null);
    const columns: ColumnDef<Customer, unknown>[] = [
      {
        accessorKey: 'name',
        header: 'Customer',
        cell: (c) => <span className="font-medium">{c.row.original.name}</span>,
      },
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'city', header: 'City' },
      {
        accessorKey: 'balance',
        header: 'Balance (PKR)',
        cell: (c) => <span className="tabular">{money(c.row.original.balance)}</span>,
      },
      { accessorKey: 'due', header: 'Next due' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (c) => (
          <StatusChip status={c.row.original.status} label={STATUS[c.row.original.status]!} />
        ),
      },
    ];
    const rows = CUSTOMERS.filter(
      (c) =>
        `${c.name} ${c.code} ${c.city}`.toLowerCase().includes(search.toLowerCase()) &&
        (!filter || c.status === filter),
    );
    return (
      <CompanyShell active="customers">
        <PageHeader
          breadcrumbs={
            <Breadcrumbs
              label="Breadcrumbs"
              items={[{ label: 'Sales & CRM', href: '#' }, { label: 'Customers' }]}
            />
          }
          title="Customers"
          count={rows.length}
          description="Everyone you sell to, with what they owe."
          actions={
            <>
              <SampleChip />
              <Button variant="secondary" icon={<Download className="size-4" />}>
                Export
              </Button>
              <Button icon={<Plus className="size-4" />}>New customer</Button>
            </>
          }
        />
        <FilterBar search={search} onSearch={setSearch} searchLabel="Search name, code or city">
          {(['overdue', 'due_soon', 'active'] as const).map((s) => (
            <FilterChip
              key={s}
              label={STATUS[s]}
              count={CUSTOMERS.filter((c) => c.status === s).length}
              active={filter === s}
              onClick={() => setFilter(filter === s ? null : s)}
            />
          ))}
        </FilterBar>
        <DataGrid
          data={rows}
          columns={columns}
          getRowId={(r) => r.id}
          labels={labels}
          onRowClick={() => undefined}
        />
      </CompanyShell>
    );
  },
};

export const SignIn: Story = {
  name: 'Company app · sign-in',
  render: () => (
    <AuthLayout
      logo={<Logo name="ERP System" />}
      title="Sign in"
      description="Use the e-mail address your company invited."
    >
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <Input label="E-mail" type="email" defaultValue="sana@example.com" />
        <PasswordInput label="Password" showLabel="Show" hideLabel="Hide" />
        <Button size="lg" className="w-full">
          Sign in
        </Button>
        <a
          href="#"
          className="text-center text-sm font-medium text-link no-underline hover:underline"
        >
          Forgot your password?
        </a>
      </form>
    </AuthLayout>
  ),
};

// ── Platform Console ─────────────────────────────────────────────────────────────────────────

const consoleNav = (active: string): NavGroup[] => [
  {
    key: 'main',
    label: 'Console',
    items: [
      {
        key: 'dash',
        label: 'Dashboard',
        href: '#',
        icon: <LayoutDashboard />,
        active: active === 'dash',
      },
      { key: 'requests', label: 'Access Requests', href: '#', icon: <Inbox />, badge: 7 },
      {
        key: 'tenants',
        label: 'Tenants',
        href: '#',
        icon: <Building2 />,
        active: active === 'tenants',
      },
      { key: 'changes', label: 'Change Requests', href: '#', icon: <ListChecks />, badge: 3 },
    ],
  },
  {
    key: 'catalogue',
    label: 'Catalogue',
    items: [
      { key: 'modules', label: 'Modules & Features', href: '#', icon: <Package /> },
      { key: 'templates', label: 'Industry Templates', href: '#', icon: <LayoutTemplate /> },
      { key: 'plans', label: 'Plans & Add-ons', href: '#', icon: <Tags /> },
      { key: 'packs', label: 'Country Packs', href: '#', icon: <Globe2 /> },
    ],
  },
  {
    key: 'governance',
    label: 'Governance',
    items: [
      { key: 'approvals', label: 'Approvals', href: '#', icon: <ClipboardCheck />, badge: 2 },
      { key: 'audit', label: 'Audit Log', href: '#', icon: <ScrollText /> },
      { key: 'staff', label: 'Staff', href: '#', icon: <Users /> },
    ],
  },
];

function ConsoleShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <AppShell
      collapseLabel="Collapse"
      expandLabel="Expand the menu"
      nav={(collapsed) => (
        <SideNav groups={consoleNav(active)} label="Console menu" collapsed={collapsed} />
      )}
      topBar={
        <TopBar
          start={<Logo name="ERP System" subtitle="Platform Console" />}
          center={
            <SearchButton label="Search tenants, requests, invoices…" onClick={() => undefined} />
          }
          end={
            <>
              <IconButton label="Notifications">
                <Bell className="size-5" />
              </IconButton>
              <IconButton label="Help">
                <CircleHelp className="size-5" />
              </IconButton>
              <AvatarButton name="Omar Owner" label="Your account" className="ms-1" />
            </>
          }
        />
      }
    >
      {children}
    </AppShell>
  );
}

function Bars({ rows }: { rows: [string, number, string][] }) {
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {rows.map(([label, n, tone]) => (
        <li key={label} className="grid grid-cols-[120px_1fr_40px] items-center gap-3 text-sm">
          <span className="text-muted">{label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-subtle">
            <span
              className={`block h-full rounded-full ${tone}`}
              style={{ width: `${(n / max) * 100}%` }}
            />
          </span>
          <span className="text-end font-medium tabular">{n}</span>
        </li>
      ))}
    </ul>
  );
}

export const ConsoleDashboard: Story = {
  name: 'Platform Console · dashboard',
  render: () => (
    <ConsoleShell active="dash">
      <PageHeader
        title="Dashboard"
        description="Thursday, 29 October 2026 · Platform Owner"
        actions={<SampleChip />}
      />
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiTile
            label="Monthly recurring revenue"
            value="PKR 1.84M"
            delta="+6.2%"
            trend="up"
            hint="vs September"
          />
          <KpiTile label="Active tenants" value="128" delta="+9" trend="up" hint="this month" />
          <KpiTile label="Trials ending in 7 days" value="6" hint="2 with high activity" />
          <KpiTile label="Overdue" value="PKR 212K" delta="4 tenants" trend="down" />
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Waiting for you" className="xl:col-span-1">
            <ul className="m-0 flex list-none flex-col divide-y divide-line p-0 text-sm">
              {[
                [<Inbox key="i" className="size-4" />, 'Verified requests not assigned', 4],
                [
                  <TriangleAlert key="t" className="size-4" />,
                  'Requests past their response target',
                  2,
                ],
                [<Activity key="a" className="size-4" />, 'Provisioning failures', 1],
                [<ListChecks key="l" className="size-4" />, 'Change requests', 3],
              ].map(([icon, label, n]) => (
                <li key={label as string} className="flex items-center gap-3 py-2.5">
                  <span className="text-muted">{icon}</span>
                  <span className="flex-1">{label}</span>
                  <span className="font-semibold tabular">{n as number}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Tenants by status" className="xl:col-span-1">
            <Bars
              rows={[
                ['Active', 128, 'bg-success'],
                ['Trial', 34, 'bg-info'],
                ['Past due', 9, 'bg-warning'],
                ['Suspended', 3, 'bg-danger'],
              ]}
            />
          </Card>
          <Card title="Onboarding funnel · 30 days" className="xl:col-span-1">
            <Bars
              rows={[
                ['Requests', 61, 'bg-primary'],
                ['Approved', 44, 'bg-primary'],
                ['Provisioned', 41, 'bg-primary'],
                ['Owner active', 37, 'bg-primary'],
                ['Paid', 22, 'bg-primary'],
              ]}
            />
          </Card>
        </div>
      </div>
    </ConsoleShell>
  ),
};

type Tenant = {
  id: string;
  name: string;
  code: string;
  slug: string;
  industry: string;
  plan: string;
  status: string;
  users: string;
  created: string;
};
const TENANTS: Tenant[] = [
  [
    'Sample Bistro',
    'T-4X9K2P',
    'sample-bistro',
    'Restaurant & Café',
    'Business',
    'active',
    '14 / 25',
    '12 Aug 2026',
  ],
  [
    'Example Grammar School',
    'T-8M3QW7',
    'example-grammar',
    'School (K-12)',
    'Premium',
    'trial',
    '41 / 100',
    '03 Oct 2026',
  ],
  [
    'Demo Traders',
    'T-2H7LNV',
    'demo-traders',
    'General Business',
    'Starter',
    'active',
    '4 / 5',
    '21 Jul 2026',
  ],
  [
    'Test Café Chain',
    'T-9R5DXC',
    'test-cafe',
    'Restaurant & Café',
    'Enterprise',
    'past_due',
    '88 / 150',
    '02 May 2026',
  ],
  [
    'Placeholder Academy',
    'T-6B1ZTF',
    'placeholder-academy',
    'School (K-12)',
    'Business',
    'suspended',
    '17 / 25',
    '15 Jun 2026',
  ],
  [
    'Fictional Distributors',
    'T-3K8VQE',
    'fictional-dist',
    'General Business',
    'Business',
    'active',
    '22 / 25',
    '09 Sep 2026',
  ],
].map(([name, code, slug, industry, plan, status, users, created], i) => ({
  id: String(i),
  name: name!,
  code: code!,
  slug: slug!,
  industry: industry!,
  plan: plan!,
  status: status!,
  users: users!,
  created: created!,
}));
const TENANT_STATUS: Record<string, string> = {
  active: 'Active',
  trial: 'Trial',
  past_due: 'Past due',
  suspended: 'Suspended',
};

export const ConsoleTenants: Story = {
  name: 'Platform Console · tenants list',
  render: function TenantsStory() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<string | null>(null);
    const columns: ColumnDef<Tenant, unknown>[] = [
      {
        accessorKey: 'name',
        header: 'Company',
        cell: (c) => <span className="font-medium">{c.row.original.name}</span>,
      },
      {
        accessorKey: 'code',
        header: 'Tenant code',
        cell: (c) => <span className="font-mono text-xs">{c.row.original.code}</span>,
      },
      { accessorKey: 'industry', header: 'Industry' },
      { accessorKey: 'plan', header: 'Plan' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (c) => (
          <StatusChip
            status={c.row.original.status}
            label={TENANT_STATUS[c.row.original.status]!}
          />
        ),
      },
      {
        accessorKey: 'users',
        header: 'Users',
        cell: (c) => <span className="tabular">{c.row.original.users}</span>,
      },
      { accessorKey: 'created', header: 'Created' },
    ];
    const rows = TENANTS.filter(
      (t) =>
        `${t.name} ${t.code} ${t.slug}`.toLowerCase().includes(search.toLowerCase()) &&
        (!filter || t.status === filter),
    );
    return (
      <ConsoleShell active="tenants">
        <PageHeader
          title="Tenants"
          count={rows.length}
          description="Every company on the platform, its plan and its state."
          actions={
            <>
              <SampleChip />
              <Button variant="secondary" icon={<Download className="size-4" />}>
                Export CSV
              </Button>
              <Button icon={<Plus className="size-4" />}>New tenant</Button>
            </>
          }
        />
        <FilterBar
          search={search}
          onSearch={setSearch}
          searchLabel="Search name, code, slug or owner e-mail"
        >
          {(['trial', 'past_due', 'suspended'] as const).map((s) => (
            <FilterChip
              key={s}
              label={TENANT_STATUS[s]}
              count={TENANTS.filter((t) => t.status === s).length}
              active={filter === s}
              onClick={() => setFilter(filter === s ? null : s)}
            />
          ))}
        </FilterBar>
        <DataGrid
          data={rows}
          columns={columns}
          getRowId={(r) => r.id}
          labels={labels}
          onRowClick={() => undefined}
        />
      </ConsoleShell>
    );
  },
};
