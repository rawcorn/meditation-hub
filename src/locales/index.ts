import { en } from './en';
import { es } from './es';
import { Category } from '@/types';

export type Language = 'en' | 'es';
export type LocaleData = typeof en;

export const translations: Record<Language, LocaleData> = {
  en,
  es,
};

/**
 * Safely resolves nested keys like 'hero.title' or 'card.participantsCount'
 * and replaces template parameters like {count} or {email}.
 */
export function getTranslation(
  lang: Language,
  path: string,
  params?: Record<string, string | number>
): string {
  const dict = translations[lang] || translations.en;
  const keys = path.split('.');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dict;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      // Fallback to English if key missing in current language
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fallback: any = translations.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return path;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  if (!params) {
    return current;
  }

  let result = current;
  for (const [paramKey, paramVal] of Object.entries(params)) {
    result = result.replaceAll(`{${paramKey}}`, String(paramVal));
  }
  return result;
}

export function getCategoryTranslation(lang: Language, category: Category): string {
  const dict = translations[lang] || translations.en;
  if (category in dict.categories) {
    return dict.categories[category as keyof typeof dict.categories];
  }
  return category;
}
