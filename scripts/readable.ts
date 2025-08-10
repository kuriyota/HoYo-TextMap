import fs from 'node:fs/promises';
import path from 'node:path';
import { Games, GenshinVersion } from './meta.ts';
const dirname = import.meta.dirname as string;
const filename = import.meta.filename as string;

const S_DIR = path.join(dirname, '../data/readable');
await fs.mkdir(S_DIR, { recursive: true });

for (const [game, gameDir] of [['Genshin', 'AnimeGameData']]) {
  const meta = { files: [] } as any;
  await fs.mkdir(path.join(S_DIR, `${game}-${GenshinVersion}`), {
    recursive: true
  });
  const R_DIR = path.join(dirname, `../${gameDir}/Readable`);
  const dir = await fs.readdir(R_DIR);
  for (const lang of dir) {
    const langDirName = path.join(R_DIR, lang);
    const files = {} as Record<string, string>;
    const langDir = await fs.readdir(langDirName);
    for (const file of langDir) {
      const filePath = path.join(langDirName, file);
      const content = await fs.readFile(filePath, 'utf-8');
      files[file] = content;
    }
    await fs.writeFile(
      path.join(S_DIR, `${game}-${GenshinVersion}/${lang}.json`),
      JSON.stringify(files, null, 2)
    );
    meta.files.push({
      name: lang,
      path: `${game}-${GenshinVersion}/${lang}.json`,
      size: await fs
        .stat(path.join(S_DIR, `${game}-${GenshinVersion}/${lang}.json`))
        .then((stat) => stat.size)
    });
    console.log(`${game} ${lang} done`);
  }
  fs.writeFile(path.join(S_DIR, `meta.json`), JSON.stringify(meta, null, 2));
}
