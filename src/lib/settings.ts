import prisma from '@/lib/prisma';

let siteSettingsCache: Record<string, string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 1 minute

export async function getSiteSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (siteSettingsCache && now - cacheTimestamp < CACHE_TTL) {
    return siteSettingsCache;
  }

  const settings = await prisma.siteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }
  siteSettingsCache = map;
  cacheTimestamp = now;
  return map;
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const settings = await getSiteSettings();
  return settings[key] ?? fallback;
}

export async function getSiteUrl(): Promise<string> {
  return getSetting('siteUrl', process.env.SITE_URL || 'https://meetzone.es');
}

export function invalidateSettingsCache() {
  siteSettingsCache = null;
  cacheTimestamp = 0;
}
