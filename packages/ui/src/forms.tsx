import { zodResolver } from '@hookform/resolvers/zod';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import * as RadixSelect from '@radix-ui/react-select';
import {
  Check,
  ChevronDown,
  Circle,
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from 'lucide-react';
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';
import { cn } from './cn';

// The form kit (Part 12 §12.6): labelled inputs with their errors announced to screen readers,
// a password input with the live rule checklist (§5.3.1), select, checkbox, textarea, and a
// Form bound to a contracts schema. Text comes from the app; the kit holds no words of its own.

export const fieldClass =
  'w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-fg shadow-1 transition-[border-color,box-shadow] duration-150 outline-none focus:border-focus focus:ring-3 focus:ring-focus/20 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-muted aria-invalid:border-danger aria-invalid:focus:ring-danger/20';

const labelClass = 'text-sm font-medium text-fg';

function Described({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <span id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} role="alert" className="text-xs font-medium text-danger">
          {error}
        </span>
      )}
    </>
  );
}

const describedBy = (id: string, hint?: string, error?: string) =>
  [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  /** Something inside the field at its end, such as a show/hide button. */
  adornment?: ReactNode;
};

/** A labelled input; its hint and error are tied to it with aria-describedby. */
export function Input({ label, hint, error, adornment, id, className, ...props }: InputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={inputId} className={labelClass}>
        {label}
      </Label.Root>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(inputId, hint, error)}
          className={cn(fieldClass, 'h-9', adornment ? 'pe-16' : undefined, className)}
          {...props}
        />
        {adornment && <div className="absolute inset-y-0 end-1 flex items-center">{adornment}</div>}
      </div>
      <Described id={inputId} hint={hint} error={error} />
    </div>
  );
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function Textarea({ label, hint, error, id, className, ...props }: TextareaProps) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={inputId} className={labelClass}>
        {label}
      </Label.Root>
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(inputId, hint, error)}
        className={cn(fieldClass, 'min-h-24 py-2', className)}
        {...props}
      />
      <Described id={inputId} hint={hint} error={error} />
    </div>
  );
}

export type ChecklistItem = { key: string; ok: boolean; label: string };

export type PasswordInputProps = Omit<InputProps, 'type' | 'adornment'> & {
  /** Rules to show live under the field (§5.3.1); omit for sign-in. */
  checklist?: ChecklistItem[];
  showLabel: string;
  hideLabel: string;
};

/** A password input with a show/hide button and, when setting a password, the rule checklist. */
export function PasswordInput({ checklist, showLabel, hideLabel, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        adornment={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            className="h-7 cursor-pointer rounded-sm px-2 text-xs font-medium text-link hover:bg-subtle"
          >
            {visible ? hideLabel : showLabel}
          </button>
        }
      />
      {checklist && (
        <ul aria-live="polite" className="m-0 grid list-none gap-1 p-0 text-xs">
          {checklist.map((item) => (
            <li
              key={item.key}
              data-ok={item.ok}
              className={cn('flex items-center gap-1.5', item.ok ? 'text-success' : 'text-muted')}
            >
              {item.ok ? (
                <CircleCheck aria-hidden className="size-3.5" />
              ) : (
                <Circle aria-hidden className="size-3.5" />
              )}
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type SelectOption = { value: string; label: string };

/** A labelled single choice from a short list (Radix Select: keyboard and screen readers). */
export function Select({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  hint,
  disabled,
  id,
}: {
  label: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  id?: string;
}) {
  const auto = useId();
  const selectId = id ?? auto;
  return (
    <div className="flex flex-col gap-1.5">
      <Label.Root htmlFor={selectId} className={labelClass}>
        {label}
      </Label.Root>
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={selectId}
          aria-describedby={describedBy(selectId, hint)}
          className={cn(fieldClass, 'flex h-9 cursor-pointer items-center justify-between gap-2')}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown aria-hidden className="size-4 text-muted" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-60 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-md border border-line bg-surface p-1 text-sm text-fg shadow-2"
          >
            <RadixSelect.Viewport>
              {options.map((o) => (
                <RadixSelect.Item
                  key={o.value}
                  value={o.value}
                  className="relative flex h-8 cursor-pointer items-center rounded-sm ps-7 pe-2 outline-none select-none data-highlighted:bg-subtle"
                >
                  <RadixSelect.ItemIndicator className="absolute start-2">
                    <Check aria-hidden className="size-4 text-link" />
                  </RadixSelect.ItemIndicator>
                  <RadixSelect.ItemText>{o.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      <Described id={selectId} hint={hint} />
    </div>
  );
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  disabled,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  disabled?: boolean;
  id?: string;
}) {
  const auto = useId();
  const boxId = id ?? auto;
  return (
    <span className="inline-flex items-center gap-2">
      <RadixCheckbox.Root
        id={boxId}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(c) => onCheckedChange(c === true)}
        className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-line-strong bg-surface shadow-1 data-[state=checked]:border-primary data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-55"
      >
        <RadixCheckbox.Indicator>
          <Check aria-hidden strokeWidth={3} className="size-3 text-on-primary" />
        </RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <label htmlFor={boxId} className="cursor-pointer text-sm text-fg select-none">
        {label}
      </label>
    </span>
  );
}

export type FormProps<S extends z.ZodType<FieldValues, FieldValues>> = {
  schema: S;
  defaultValues?: DefaultValues<z.input<S>>;
  onSubmit: SubmitHandler<z.output<S>>;
  children: (form: UseFormReturn<z.input<S>, unknown, z.output<S>>) => ReactNode;
  className?: string;
};

/** A form validated by a contracts schema before it is sent. */
export function Form<S extends z.ZodType<FieldValues, FieldValues>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: FormProps<S>) {
  const form = useForm<z.input<S>, unknown, z.output<S>>({
    // The resolver's types are generic over every schema; this one is bound to `schema`.
    resolver: zodResolver(schema as never) as unknown as Resolver<z.input<S>, unknown, z.output<S>>,
    defaultValues,
  });
  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-4', className)}
      >
        {children(form)}
      </form>
    </FormProvider>
  );
}

/** An Input registered with the surrounding Form; its error comes from the schema. */
export function TextField<T extends FieldValues>({
  name,
  ...props
}: Omit<InputProps, 'name' | 'error'> & { name: Path<T> }) {
  const { register, formState } = useFormContext<T>();
  const error = formState.errors[name]?.message;
  return (
    <Input {...props} {...register(name)} error={typeof error === 'string' ? error : undefined} />
  );
}

export type BannerTone = 'info' | 'success' | 'warning' | 'error';

export type BannerProps = {
  tone?: BannerTone;
  title?: string;
  children: ReactNode;
  /** An action at the end, such as "Try again" or "Request access". */
  action?: ReactNode;
};

const BANNER: Record<BannerTone, { box: string; icon: ReactNode }> = {
  info: {
    box: 'border-info/30 bg-info-subtle',
    icon: <Info aria-hidden className="size-5 text-info" />,
  },
  success: {
    box: 'border-success/30 bg-success-subtle',
    icon: <CircleCheck aria-hidden className="size-5 text-success" />,
  },
  warning: {
    box: 'border-warning/30 bg-warning-subtle',
    icon: <TriangleAlert aria-hidden className="size-5 text-warning" />,
  },
  error: {
    box: 'border-danger/30 bg-danger-subtle',
    icon: <CircleAlert aria-hidden className="size-5 text-danger" />,
  },
};

/** A message across the page: errors are announced at once, others politely. */
export function Banner({ tone = 'info', title, children, action }: BannerProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      data-tone={tone}
      className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', BANNER[tone].box)}
    >
      <span className="mt-px shrink-0">{BANNER[tone].icon}</span>
      <div className="min-w-0 flex-1 text-fg">
        {title && <strong className="block font-semibold">{title}</strong>}
        {children}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
