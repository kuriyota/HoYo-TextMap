import { basename } from 'node:path';

export const LANGUAGE_META = [
  { name: '简体中文', lang: 'zh-Hans', id: 'CHS' },
  { name: '繁體中文', lang: 'zh-Hant', id: 'CHT' },
  { name: 'Deutsch', lang: 'de', id: 'DE' },
  { name: 'English', lang: 'en', id: 'EN' },
  { name: 'Español', lang: 'es', id: 'ES' },
  { name: 'Français', lang: 'fr', id: 'FR' },
  { name: 'Bahasa Indonesia', lang: 'id', id: 'ID' },
  { name: 'Italiano', lang: 'it', id: 'IT' },
  { name: '日本語', lang: 'ja', id: 'JP' },
  { name: '한국어', lang: 'ko', id: 'KR' },
  { name: 'Português', lang: 'pt', id: 'PT' },
  { name: 'Русский', lang: 'ru', id: 'RU' },
  { name: 'ไทย', lang: 'th', id: 'TH' },
  { name: 'Türkçe', lang: 'tr', id: 'TR' },
  { name: 'Tiếng Việt', lang: 'vi', id: 'VI' }
];

export const GenshinVersion = '4.8';
export const StarRailVersion = '3.4';
export const Games = {
  Genshin: 'AnimeGameData',
  StarRail: 'TurnBasedGameData'
};

export function getLanguageMetaFromFilename(
  filename: string
): (typeof LANGUAGE_META)[0] | null {
  const base = basename(filename);

  const match = base.match(/^TextMap([A-Z]{2,3})(?:_\d+)?\.json$/i);
  if (!match) return null;

  const id = match[1].toUpperCase();

  return LANGUAGE_META.find((meta) => meta.id === id) || null;
}
