import { LoaderCircle } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from './cn';

// Buttons (§12.6): one primary action per page (top right, §12.1 #3), secondary for the rest,
// ghost for quiet actions in toolbars, danger for destructive ones.

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** An icon before the text, usually from lucide-react. */
  icon?: ReactNode;
  /** Shows a spinner and refuses clicks while the action runs. */
  loading?: boolean;
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary shadow-1 hover:bg-primary-hover',
  secondary: 'border border-line-strong bg-surface text-fg shadow-1 hover:bg-subtle',
  ghost: 'text-fg hover:bg-subtle',
  danger: 'bg-danger-solid text-white shadow-1 hover:bg-danger-solid-hover',
  link: 'text-link underline-offset-4 hover:underline',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-sm',
  md: 'h-9 gap-2 px-4 text-sm',
  lg: 'h-11 gap-2 px-5 text-base',
};

export const buttonClass = (variant: ButtonVariant = 'primary', size: ButtonSize = 'md') =>
  cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md font-medium whitespace-nowrap transition-colors duration-150 select-none',
    'disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55',
    VARIANTS[variant],
    variant === 'link' ? 'h-auto px-0' : SIZES[size],
  );

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    className,
    children,
    type = 'button',
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClass(variant, size), className)}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});

/** A button that is only an icon: the label is for screen readers and the tooltip. */
export const IconButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; size?: ButtonSize }
>(function IconButton({ label, size = 'md', className, type = 'button', ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-subtle hover:text-fg disabled:cursor-not-allowed disabled:opacity-55',
        size === 'sm' ? 'size-8' : size === 'lg' ? 'size-11' : 'size-9',
        className,
      )}
      {...props}
    />
  );
});
