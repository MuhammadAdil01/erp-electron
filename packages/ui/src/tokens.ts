// Design tokens (§12.6). Components read them as CSS variables, so the light and dark values
// switch without re-rendering. Light is the default; dark applies only when the person picks
// it in the account menu (D13, §2.13) — never because the operating system is dark.

type ColorRoles = {
  /** The page behind the content. */
  background: string;
  /** Cards, panels, the top bar and the sidebar. */
  surface: string;
  /** Table headers, hovered rows, quiet fills. */
  surfaceSubtle: string;
  text: string;
  textMuted: string;
  /** Placeholders and the least important text; still AA on surface. */
  textSubtle: string;
  border: string;
  /** Input borders. */
  borderStrong: string;
  /** Primary buttons. */
  primary: string;
  primaryHover: string;
  onPrimary: string;
  /** Links and selected navigation text. */
  primaryText: string;
  /** Selected navigation and other quiet primary fills. */
  primarySubtle: string;
  focus: string;
  success: string;
  danger: string;
  /** Destructive buttons: white text on it in both themes. */
  dangerSolid: string;
  dangerSolidHover: string;
  /** Status chips (§12.5): amber, blue, purple and the dark green of posted documents. */
  warning: string;
  info: string;
  offline: string;
  posted: string;
  /** Tinted backgrounds behind status text and banners. */
  neutralSubtle: string;
  successSubtle: string;
  dangerSubtle: string;
  warningSubtle: string;
  infoSubtle: string;
  offlineSubtle: string;
};

export const colors: { light: ColorRoles; dark: ColorRoles } = {
  light: {
    background: '#f5f7fa',
    surface: '#ffffff',
    surfaceSubtle: '#f1f5f9',
    text: '#0f172a',
    textMuted: '#475569',
    textSubtle: '#606f86',
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    onPrimary: '#ffffff',
    primaryText: '#1d4ed8',
    primarySubtle: '#eff6ff',
    focus: '#2563eb',
    success: '#15803d',
    danger: '#b91c1c',
    dangerSolid: '#b91c1c',
    dangerSolidHover: '#991b1b',
    warning: '#b45309',
    info: '#1d4ed8',
    offline: '#7e22ce',
    posted: '#166534',
    neutralSubtle: '#f1f5f9',
    successSubtle: '#f0fdf4',
    dangerSubtle: '#fef2f2',
    warningSubtle: '#fffbeb',
    infoSubtle: '#eff6ff',
    offlineSubtle: '#faf5ff',
  },
  dark: {
    background: '#0b1120',
    surface: '#111827',
    surfaceSubtle: '#1a2233',
    text: '#e5e7eb',
    textMuted: '#9ca3af',
    textSubtle: '#8b95a7',
    border: '#253045',
    borderStrong: '#374357',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    onPrimary: '#ffffff',
    primaryText: '#7cb0ff',
    primarySubtle: '#172554',
    focus: '#60a5fa',
    success: '#4ade80',
    danger: '#f87171',
    dangerSolid: '#b91c1c',
    dangerSolidHover: '#991b1b',
    warning: '#fbbf24',
    info: '#7cb0ff',
    offline: '#c084fc',
    posted: '#22c55e',
    neutralSubtle: '#1e293b',
    successSubtle: '#052e16',
    dangerSubtle: '#450a0a',
    warningSubtle: '#422006',
    infoSubtle: '#172554',
    offlineSubtle: '#3b0764',
  },
};

/** 4 px grid: space(2) === '8px'. */
export const SPACING_UNIT_PX = 4;
export const space = (steps: number): string => `${steps * SPACING_UNIT_PX}px`;

export const radii = { sm: '4px', md: '8px', lg: '12px' } as const;

/** Three elevation levels (§12.6), darker in the dark theme so they still read. */
const shadows = {
  light: [
    '0 1px 2px rgb(15 23 42 / 0.06)',
    '0 4px 12px rgb(15 23 42 / 0.08)',
    '0 16px 40px rgb(15 23 42 / 0.16)',
  ],
  dark: [
    '0 1px 2px rgb(0 0 0 / 0.4)',
    '0 4px 12px rgb(0 0 0 / 0.45)',
    '0 16px 40px rgb(0 0 0 / 0.55)',
  ],
};

const cssName = (role: string) =>
  `--erp-color-${role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

const declarations = (roles: ColorRoles, mode: 'light' | 'dark') =>
  [
    ...Object.entries(roles).map(([role, value]) => `${cssName(role)}: ${value};`),
    ...shadows[mode].map((s, i) => `--erp-shadow-${i + 1}: ${s};`),
    `color-scheme: ${mode};`,
  ].join(' ');

/** CSS that defines every token as a variable: light on :root, dark under data-theme="dark". */
export const tokensCss = [
  `:root { ${declarations(colors.light, 'light')} --erp-radius-sm: ${radii.sm}; --erp-radius-md: ${radii.md}; --erp-radius-lg: ${radii.lg}; --erp-space: ${SPACING_UNIT_PX}px; }`,
  `:root[data-theme='dark'] { ${declarations(colors.dark, 'dark')} }`,
  // PasswordInput has its own show/hide button; hide Edge's built-in one.
  'input::-ms-reveal, input::-ms-clear { display: none; }',
].join('\n');

/** Adds the token variables to the document once. */
export function injectTokens(doc: Document = document): void {
  if (doc.getElementById('erp-tokens')) return;
  const style = doc.createElement('style');
  style.id = 'erp-tokens';
  style.textContent = tokensCss;
  doc.head.appendChild(style);
}

/** `var(--erp-color-…)` for a colour role. */
export const color = (role: keyof ColorRoles): string => `var(${cssName(role)})`;

// ── Theme: light unless the person chose dark (kept on this device) ─────────────────────────

export type Theme = 'light' | 'dark';
const THEME_KEY = 'erp.theme';

export function storedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** Shows the theme and remembers the choice; light removes the attribute altogether. */
export function applyTheme(theme: Theme, doc: Document = document): void {
  if (theme === 'dark') doc.documentElement.setAttribute('data-theme', 'dark');
  else doc.documentElement.removeAttribute('data-theme');
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked: the choice lasts until the page closes.
  }
}

export function currentTheme(doc: Document = document): Theme {
  return doc.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}
