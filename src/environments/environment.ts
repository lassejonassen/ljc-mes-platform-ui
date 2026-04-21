import { version } from './version';

export const environment = {
    production: false,
    projectName: 'LJT-MES',
    applicationName: 'LJT-MES Platform',
    applicationShortName: 'MES',
    applicationVersion: version,
    supportedLanguages: ['en-GB', 'da-DK'],
    defaultLanguage: 'en-GB',
    apiBaseUrl: 'http://localhost:5048/api'
};
