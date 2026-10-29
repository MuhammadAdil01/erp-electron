import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Plus, Trash2, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { Button, IconButton } from '../Button';
import { DataGrid, FilterBar, FilterChip, type ColumnDef } from '../data-grid';
import { Banner, Checkbox, Input, PasswordInput, Select, Textarea } from '../forms';
import {
  Badge,
  Breadcrumbs,
  Card,
  Combobox,
  Dialog,
  Drawer,
  EmptyState,
  KpiTile,
  Menu,
  PageHeader,
  Skeleton,
  StatusChip,
  Stepper,
  Switch,
  Tabs,
} from '../kit';
import { ToastProvider, useToast } from '../toast';
import { colors } from '../tokens';

// The components of Part 12 §12.6, one story each. Words are sample English; the apps pass
// their translations.

const meta: Meta = { title: 'Design system/Components' };
export default meta;
type Story = StoryObj;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-wrap items-center gap-3">{children}</div>
);

export const Colours: Story = {
  render: () => (
    <div className="grid gap-6">
      {(['light', 'dark'] as const).map((mode) => (
        <div key={mode}>
          <h3 className="m-0 mb-3 text-sm font-semibold text-fg capitalize">{mode}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
            {Object.entries(colors[mode]).map(([role, hex]) => (
              <div key={role} className="overflow-hidden rounded-md border border-line bg-surface">
                <div className="h-12" style={{ background: hex }} />
                <div className="px-2 py-1.5 text-xs">
                  <div className="font-medium text-fg">{role}</div>
                  <div className="font-mono text-muted">{hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="grid gap-3 text-fg">
      <div className="text-2xl font-semibold tracking-tight">32 · Page hero</div>
      <div className="text-xl font-semibold tracking-tight">24 · Page title</div>
      <div className="text-lg font-semibold">20 · Section title</div>
      <div className="text-base">16 · Large body</div>
      <div className="text-sm">14 · Body: the default for back-office screens</div>
      <div className="text-xs text-muted">12 · Captions, hints and table headers</div>
      <div className="text-sm tabular">Amounts line up: 1,250,000.00 · 98,431.50 · 7.25</div>
    </div>
  ),
};

export const Buttons: Story = {
  render: () => (
    <div className="grid gap-4">
      <Row>
        <Button icon={<Plus className="size-4" />}>New invoice</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">More</Button>
        <Button variant="danger" icon={<Trash2 className="size-4" />}>
          Delete
        </Button>
        <Button variant="link">View journal</Button>
      </Row>
      <Row>
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="lg">Large</Button>
        <Button loading>Saving</Button>
        <Button disabled>Disabled</Button>
        <IconButton label="Download">
          <Download className="size-5" />
        </IconButton>
      </Row>
    </div>
  ),
};

export const FormControls: Story = {
  render: function FormControlsStory() {
    const [plan, setPlan] = useState<string>('business');
    const [on, setOn] = useState(true);
    const [check, setCheck] = useState(false);
    const [module, setModule] = useState<string | null>(null);
    return (
      <div className="grid max-w-xl gap-5">
        <Input label="Company name" placeholder="As registered" hint="Shown on invoices" />
        <Input label="NTN" defaultValue="12345" error="NTN has 7 digits and a check digit" />
        <PasswordInput
          label="New password"
          defaultValue="tea at noon"
          showLabel="Show"
          hideLabel="Hide"
          checklist={[
            { key: 'length', ok: false, label: 'At least 15 characters' },
            { key: 'not_email', ok: true, label: 'Does not contain your e-mail name' },
          ]}
        />
        <Select
          label="Plan"
          value={plan}
          onValueChange={setPlan}
          options={[
            { value: 'starter', label: 'Starter' },
            { value: 'business', label: 'Business' },
            { value: 'premium', label: 'Premium' },
          ]}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Module</span>
          <Combobox
            label="Module"
            value={module}
            onChange={setModule}
            placeholder="Search modules…"
            emptyLabel="No module matches"
            options={[
              { value: 'finance', label: 'Finance', hint: 'Phase 1' },
              { value: 'sales', label: 'Sales & CRM', hint: 'Phase 1' },
              { value: 'restaurant', label: 'Restaurant', hint: 'Phase 2' },
            ]}
          />
        </div>
        <Textarea label="Reason" placeholder="Why — kept in the audit log" />
        <Switch checked={on} onCheckedChange={setOn} label="Two-step sign-in required" />
        <Checkbox
          checked={check}
          onCheckedChange={setCheck}
          label="I have saved my recovery codes"
        />
      </div>
    );
  },
};

export const StatusChips: Story = {
  render: () => (
    <Row>
      <StatusChip status="draft" label="Draft" />
      <StatusChip status="pending" label="Submitted" />
      <StatusChip status="approved" label="Approved" />
      <StatusChip status="posted" label="Posted" />
      <StatusChip status="due_soon" label="Due soon" />
      <StatusChip status="overdue" label="Overdue" />
      <StatusChip status="cancelled" label="Cancelled" />
      <StatusChip status="queued" label="Queued" />
      <Badge>3</Badge>
      <Badge tone="neutral">12</Badge>
    </Row>
  ),
};

function ToastButton() {
  const toast = useToast();
  return (
    <Row>
      <Button variant="secondary" onClick={() => toast('Invoice posted', 'success')}>
        Success toast
      </Button>
      <Button variant="secondary" onClick={() => toast('Could not reach the server', 'error')}>
        Error toast
      </Button>
    </Row>
  );
}

export const Feedback: Story = {
  render: () => (
    <ToastProvider closeLabel="Close">
      <div className="grid max-w-3xl gap-4">
        <Banner tone="info" title="Period closed">
          September 2026 is closed; changes post to October.
        </Banner>
        <Banner tone="success">Two-step sign-in is on.</Banner>
        <Banner
          tone="warning"
          title="Trial ends in 5 days"
          action={<Button size="sm">Choose a plan</Button>}
        >
          Your data stays; choose a plan to keep working.
        </Banner>
        <Banner tone="error" title="Could not save">
          The server did not answer. Try again; quote 01a1846e when you contact support.
        </Banner>
        <EmptyState
          title="No customers yet"
          description="Customers you sell to appear here. Add one, or import a list."
          action={<Button icon={<Plus className="size-4" />}>Add customer</Button>}
        />
        <Card title="Loading">
          <Skeleton lines={4} label="Loading" />
        </Card>
        <ToastButton />
      </div>
    </ToastProvider>
  ),
};

export const Overlays: Story = {
  render: function OverlaysStory() {
    const [dialog, setDialog] = useState(false);
    const [drawer, setDrawer] = useState(false);
    return (
      <Row>
        <Button onClick={() => setDialog(true)}>Open dialog</Button>
        <Button variant="secondary" onClick={() => setDrawer(true)}>
          Open drawer
        </Button>
        <Menu
          trigger={<Button variant="secondary">Menu</Button>}
          items={[
            { key: 'edit', label: 'Edit', onSelect: () => undefined },
            { key: 'dup', label: 'Duplicate', onSelect: () => undefined },
            { key: 's', separator: true },
            { key: 'del', label: 'Delete', danger: true, onSelect: () => undefined },
          ]}
        />
        <Dialog
          open={dialog}
          onOpenChange={setDialog}
          title="Suspend this company?"
          description="Members keep read-only access until it is reactivated."
          closeLabel="Cancel"
          footer={<Button variant="danger">Suspend</Button>}
        >
          <Textarea label="Reason" placeholder="Kept in the audit log" />
        </Dialog>
        <Drawer open={drawer} onOpenChange={setDrawer} title="INV-2026-000412" closeLabel="Close">
          <p className="m-0 text-sm text-muted">
            A quick view of a related record, without leaving the page.
          </p>
        </Drawer>
      </Row>
    );
  },
};

export const Navigation: Story = {
  render: function NavigationStory() {
    const [tab, setTab] = useState('details');
    return (
      <div className="grid gap-6">
        <Breadcrumbs
          label="Breadcrumbs"
          items={[
            { label: 'Finance', href: '#' },
            { label: 'Journal entries', href: '#' },
            { label: 'JE-2026-000412' },
          ]}
        />
        <Stepper
          label="Provisioning"
          current={2}
          steps={['Request', 'Industry', 'Modules', 'Limits', 'Review']}
        />
        <Tabs
          label="Record"
          value={tab}
          onValueChange={setTab}
          tabs={[
            {
              value: 'details',
              label: 'Details',
              content: <p className="m-0 text-sm">Party, dates and terms.</p>,
            },
            {
              value: 'activity',
              label: 'Activity',
              content: <p className="m-0 text-sm">Timeline and comments.</p>,
            },
            {
              value: 'audit',
              label: 'Audit',
              content: <p className="m-0 text-sm">Who changed what.</p>,
            },
          ]}
        />
      </div>
    );
  },
};

type Customer = { id: string; name: string; city: string; balance: number; status: string };
const customers: Customer[] = [
  { id: '1', name: 'Sample Trading Co.', city: 'Lahore', balance: 245000, status: 'active' },
  { id: '2', name: 'Example Foods Ltd.', city: 'Karachi', balance: 0, status: 'active' },
  { id: '3', name: 'Demo Textiles', city: 'Faisalabad', balance: 1250000, status: 'overdue' },
  { id: '4', name: 'Test Pharmacy', city: 'Islamabad', balance: 98000, status: 'due_soon' },
];
const money = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;
const STATUS: Record<string, string> = {
  active: 'Active',
  overdue: 'Overdue',
  due_soon: 'Due soon',
};

export const DataAndKpis: Story = {
  render: function DataStory() {
    const [search, setSearch] = useState('');
    const [overdue, setOverdue] = useState(false);
    const columns: ColumnDef<Customer, unknown>[] = [
      { accessorKey: 'name', header: 'Customer' },
      { accessorKey: 'city', header: 'City' },
      { accessorKey: 'balance', header: 'Balance', cell: (c) => money(c.row.original.balance) },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (c) => (
          <StatusChip status={c.row.original.status} label={STATUS[c.row.original.status]!} />
        ),
      },
    ];
    const rows = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) && (!overdue || c.status === 'overdue'),
    );
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiTile
            label="Receivables"
            value={money(1593000)}
            delta="+8%"
            trend="up"
            hint="vs last month"
            icon={<Wallet className="size-4" />}
          />
          <KpiTile label="Overdue" value={money(1250000)} delta="1 customer" trend="down" />
          <KpiTile label="Customers" value="4" icon={<Users className="size-4" />} />
        </div>
        <div>
          <PageHeader
            title="Customers"
            count={rows.length}
            actions={<Button icon={<Plus className="size-4" />}>New customer</Button>}
          />
          <FilterBar search={search} onSearch={setSearch} searchLabel="Search customers">
            <FilterChip
              label="Overdue"
              active={overdue}
              count={1}
              onClick={() => setOverdue(!overdue)}
            />
          </FilterBar>
          <DataGrid
            data={rows}
            columns={columns}
            getRowId={(r) => r.id}
            labels={{
              columns: 'Columns',
              views: 'Saved views',
              saveView: 'Save view',
              viewName: 'View name',
              noRows: 'No customers match',
              density: 'Density',
            }}
          />
        </div>
      </div>
    );
  },
};
