import { basename } from "@std/path";

export const LANGUAGE_META = [
  { name: "简体中文", lang: "zh-Hans", id: "CHS" },
  { name: "繁體中文", lang: "zh-Hant", id: "CHT" },
  { name: "Deutsch", lang: "de", id: "DE" },
  { name: "English", lang: "en", id: "EN" },
  { name: "Español", lang: "es", id: "ES" },
  { name: "Français", lang: "fr", id: "FR" },
  { name: "Bahasa Indonesia", lang: "id", id: "ID" },
  { name: "Italiano", lang: "it", id: "IT" },
  { name: "日本語", lang: "ja", id: "JP" },
  { name: "한국어", lang: "ko", id: "KR" },
  { name: "Português", lang: "pt", id: "PT" },
  { name: "Русский", lang: "ru", id: "RU" },
  { name: "ไทย", lang: "th", id: "TH" },
  { name: "Türkçe", lang: "tr", id: "TR" },
  { name: "Tiếng Việt", lang: "vi", id: "VI" },
];

/**
 * 从 TextMap 文件名提取语言元数据
 * @param filename 文件名 (如 "TextMapCHS.json" 或 "TextMapTH_0.json")
 * @returns 语言元数据对象 { name: string, lang: string, id: string } | null
 */
export function getLanguageMetaFromFilename(
  filename: string,
): typeof LANGUAGE_META[0] | null {
  const base = basename(filename);

  // 匹配 TextMap{ID}[_分片].json 格式
  const match = base.match(/^TextMap([A-Z]{2,3})(?:_\d+)?\.json$/i);
  if (!match) return null;

  const id = match[1].toUpperCase();

  return LANGUAGE_META.find((meta) => meta.id === id) || null;
}
