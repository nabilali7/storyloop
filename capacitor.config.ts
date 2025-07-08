import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ionic.storyloop',
  appName: 'storyloop',
  webDir: 'www',

  server: {
    "cleartext": true,
    "androidScheme": "https",
  }
};

export default config;
