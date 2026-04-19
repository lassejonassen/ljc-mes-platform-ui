import { version } from './version';

export const environment = {
    production: false,
    projectName: 'LJT-MES',
    applicationName: 'LJT-MES Platform',
    applicationShortName: 'MES',
    applicationVersion: version,
    supportedLanguages: ['en-GB', 'da-DK'],
    defaultLanguage: 'en-GB',
    apiBaseUrl: 'https://localhost:7294/api'
};
