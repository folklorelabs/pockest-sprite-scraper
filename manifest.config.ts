import { defineManifest } from '@crxjs/vite-plugin';
import { version as versionName } from './package.json';

// Convert from Semver (example: 0.1.0-rc.6)
const [version, label = ''] = versionName.split('-');
const rcVersion = label.split('.')[1];

export default defineManifest(() => ({
  manifest_version: 3,
  name: !rcVersion ? 'Pockest Sprite Scraper' : '[BETA] Pockest Sprite Scraper',
  version: !rcVersion ? version : `${version}.${rcVersion}`,
  version_name: versionName,
  action: { default_popup: 'index.html' },
  content_scripts: [
      {
          js: ['src/scraper.tsx'],
          matches: ['https://www.streetfighter.com/6/buckler/minigame']
      }
  ],
  icons: {
      32: 'src/assets/icon32.png',
      48: 'src/assets/icon48.png',
      128: 'src/assets/icon128.png'
  }
}));
