import { zodResolver } from '@hookform/resolvers/zod';
import * as Label from '@radix-ui/react-label';
import {
  useId,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
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
import { color, radii, space } from './tokens';

// The form kit (Part 12 §12.6): labelled inputs with their errors announced to screen readers,
// a password input with the live rule checklist (§5.3.1), and a Form bound to a contracts
// schema. Text comes from the app (translated); the kit holds no words of its own.

const inputStyle: CSSProperties = {
  width: '100%',
  padding: `${space(2)} ${space(3)}`,
  border: `1px solid ${color('border')}`,
  borderRadius: radii.md,
  background: color('background'),
  color: color('text'),
  font: 'inherit',
  boxSizing: 'border-box',
};

const fieldStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space(1) };

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

/** A labelled input; its hint and error are tied to it with aria-describedby. */
export function Input({ label, hint, error, id, style, ...props }: InputProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const described = [hint && `${inputId}-hint`, error && `${inputId}-error`]
    .filter(Boolean)
    .join(' ');
  return (
    <div style={fieldStyle}>
      <Label.Root htmlFor={inputId} style={{ fontWeight: 500 }}>
        {label}
      </Label.Root>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={described || undefined}
        style={{ ...inputStyle, ...(error ? { borderColor: color('danger') } : {}), ...style }}
        {...props}
      />
      {hint && (
        <span id={`${inputId}-hint`} style={{ color: color('textMuted'), fontSize: '0.875em' }}>
          {hint}
        </span>
      )}
      {error && (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{ color: color('danger'), fontSize: '0.875em' }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

export type ChecklistItem = { key: string; ok: boolean; label: string };

export type PasswordInputProps = Omit<InputProps, 'type'> & {
  /** Rules to show live under the field (§5.3.1); omit for sign-in. */
  checklist?: ChecklistItem[];
  showLabel: string;
  hideLabel: string;
};

/** A password input with a show/hide button and, when setting a password, the rule checklist. */
export function PasswordInput({ checklist, showLabel, hideLabel, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={fieldStyle}>
      <div style={{ position: 'relative' }}>
        <Input
          {...props}
          type={visible ? 'text' : 'password'}
          style={{ paddingInlineEnd: space(16) }}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          style={{
            position: 'absolute',
            insetInlineEnd: space(2),
            bottom: props.error || props.hint ? space(8) : space(2),
            background: 'none',
            border: 'none',
            color: color('primary'),
            cursor: 'pointer',
            font: 'inherit',
          }}
        >
          {visible ? hideLabel : showLabel}
        </button>
      </div>
      {checklist && (
        <ul
          aria-live="polite"
          style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '0.875em' }}
        >
          {checklist.map((item) => (
            <li
              key={item.key}
              data-ok={item.ok}
              style={{ color: item.ok ? color('success') : color('textMuted') }}
            >
              <span aria-hidden="true">{item.ok ? '✓ ' : '○ '}</span>
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type FormProps<S extends z.ZodType<FieldValues, FieldValues>> = {
  schema: S;
  defaultValues?: DefaultValues<z.input<S>>;
  onSubmit: SubmitHandler<z.output<S>>;
  children: (form: UseFormReturn<z.input<S>, unknown, z.output<S>>) => ReactNode;
  style?: CSSProperties;
};

/** A form validated by a contracts schema before it is sent. */
export function Form<S extends z.ZodType<FieldValues, FieldValues>>({
  schema,
  defaultValues,
  onSubmit,
  children,
  style,
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
        style={{ display: 'flex', flexDirection: 'column', gap: space(4), ...style }}
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

export type BannerProps = {
  tone?: 'info' | 'success' | 'error';
  title?: string;
  children: ReactNode;
};

/** A message across the page: errors are announced at once, others politely. */
export function Banner({ tone = 'info', title, children }: BannerProps) {
  const tint =
    tone === 'error' ? color('danger') : tone === 'success' ? color('success') : color('primary');
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      style={{
        borderInlineStart: `4px solid ${tint}`,
        background: color('surface'),
        padding: `${space(3)} ${space(4)}`,
        borderRadius: radii.md,
      }}
    >
      {title && <strong style={{ display: 'block' }}>{title}</strong>}
      {children}
    </div>
  );
}
