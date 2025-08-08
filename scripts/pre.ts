import fs from 'node:fs/promises';
import path from 'node:path';
const dirname = import.meta.dirname as string;
const filename = import.meta.filename as string;
import { mergeSplitTextMaps } from './merge.ts';

export const pre = async () => {
  await fs.cp(
    path.join(dirname, '../AnimeGameData/TextMap'),
    path.join(dirname, '../text-map-raw/Genshin'),
    {
      force: true,
      recursive: true
    }
  );
  await fs.cp(
    path.join(dirname, '../TurnBasedGameData/TextMap'),
    path.join(dirname, '../text-map-raw/StarRail'),
    {
      force: true,
      recursive: true
    }
  );

  const SRFiles = await fs.readdir(
    path.join(dirname, '../TurnBasedGameData/TextMap')
  );
  for (const file of SRFiles) {
    if (file.endsWith('Main.json')) {
      await fs.rm(path.join(dirname, '../text-map-raw/StarRail/', file));
    }
  }

  await mergeSplitTextMaps(path.join(dirname, '../text-map-raw/Genshin'));
  await mergeSplitTextMaps(path.join(dirname, '../text-map-raw/StarRail'));
};
