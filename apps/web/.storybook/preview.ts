// .storybook/preview.ts

import '../src/app/globals.css';
// OR if you aren't using the app router:
// import '../src/index.css';

import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
