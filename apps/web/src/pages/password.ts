import type { PasswordRule } from '@erp/contracts';

/** The checklist text of a password rule, in the current language. */
export function ruleLabel(t: (key: string, options?: Record<string, unknown>) => string) {
  return (rule: PasswordRule) => t(`rules.${rule.key}`, { min: rule.min, max: rule.max });
}
