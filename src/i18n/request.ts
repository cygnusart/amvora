import { getRequestConfig } from 'next-intl/server';

// Import the JavaScript config directly
const i18nConfig = {
  locales: ['en', 'es', 'fr', 'de', 'hi'],
  defaultLocale: 'en',
  localeDetection: true
};

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is defined
  const currentLocale = locale || i18nConfig.defaultLocale;
  
  // Load messages for the current locale
  const messages = (await import(`../../messages/${currentLocale}.json`)).default;

  return {
    locale: currentLocale,
    messages,
    timeZone: 'UTC',
    now: new Date()
  };
});