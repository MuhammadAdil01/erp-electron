import '@fontsource-variable/inter';
import type { Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { injectTokens, type Theme } from '../src/tokens';
import './storybook.css';

injectTokens();

/** Sets the theme on the page, as the account menu does in the apps. */
function ThemeFrame({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [theme]);
  return <>{children}</>;
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: { title: 'Theme', icon: 'mirror', items: ['light', 'dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => (
      <ThemeFrame theme={context.globals.theme as Theme}>
        <Story />
      </ThemeFrame>
    ),
  ],
  parameters: {
    layout: 'padded',
    controls: { expanded: true },
    a11y: { test: 'error' },
  },
};

export default preview;
