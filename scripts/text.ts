import path, { join, relative } from 'node:path';
import fs from 'node:fs/promises';
import {
  Games,
  GenshinVersion,
  getLanguageMetaFromFilename,
  StarRailVersion
} from './meta.ts';
import { pre } from './pre.ts';
const dirname = import.meta.dirname as string;

await pre();

const Data: Record<
  string,
  {
    files: {
      path: string;
      lang: string;
      size: number;
    }[];
    version: string;
    updated: string;
  }
> = {};

await fs.mkdir(join(dirname, '../data'), { recursive: true });

const write = async (
  game: string,
  version: string,
  langCode: string,
  index: number,
  content: Buffer<ArrayBuffer>
) => {
  const dir = join(dirname, `../data/text/${game}-${version}/${langCode}`);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${game}-${version}-${langCode}-${index}.json`;
  await fs.writeFile(join(dir, filename), content);
  const size = content.length;
  console.log(`Wrote ${filename} (${size} bytes)`);
  return {
    path: relative(join(dirname, '../data/text/'), join(dir, filename)),
    size
  };
};

for (const game of Object.keys(Games)) {
  const dir = await fs.opendir(join(dirname, '../text-map-raw', game));
  const version = game === 'Genshin' ? GenshinVersion : StarRailVersion;
  Data[game] = {
    files: [],
    version,
    updated: new Date().toISOString()
  };

  for await (const entry of dir) {
    if (entry.isFile()) {
      const file = await fs.readFile(
        join(dirname, '../text-map-raw', game, entry.name),
        'utf-8'
      );
      const json = JSON.parse(file) as Record<string, string>;
      const lang = getLanguageMetaFromFilename(entry.name);
      const langCode = lang?.lang || 'unknown';

      // 分片处理
      const entries = Object.entries(json);
      let chunkIndex = 0;
      let currentSize = 1; // 初始 '{' 的大小
      let bufferChunks: Buffer[] = [Buffer.from('{')];
      let isFirstEntry = true;

      for (const [key, value] of entries) {
        // 转义特殊字符
        const escapedKey = key.replace(/[\\"]/g, '\\$&');
        const escapedValue = value
          .replace(/[\\"]/g, '\\$&')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');

        // 创建键值对缓冲区
        const entryBuffer = Buffer.from(
          `"${escapedKey}":"${escapedValue}"`,
          'utf-8'
        );

        // 计算添加后的大小（包括逗号和可能的闭括号）
        const commaSize = isFirstEntry ? 0 : 1;
        const newSize = currentSize + commaSize + entryBuffer.length;
        const closeBraceSize = 1; // '}' 的大小

        // 检查是否需要新分片（预留闭括号空间）
        if (newSize + closeBraceSize > 5 * 1024 * 1024) {
          // 完成当前分片
          bufferChunks.push(Buffer.from('}'));
          const finalBuffer = Buffer.concat(bufferChunks);

          const { path, size } = await write(
            game,
            version,
            langCode,
            chunkIndex,
            finalBuffer
          );
          Data[game].files.push({
            path,
            size,
            lang: langCode
          });

          chunkIndex++;
          currentSize = 1;
          bufferChunks = [Buffer.from('{')];
          isFirstEntry = true;
        }

        // 添加逗号（如果不是第一个条目）
        if (!isFirstEntry) {
          bufferChunks.push(Buffer.from(','));
          currentSize += 1;
        } else {
          isFirstEntry = false;
        }

        // 添加条目
        bufferChunks.push(entryBuffer);
        currentSize += entryBuffer.length;
      }

      // 写入最后一个分片
      if (bufferChunks.length > 1 || currentSize > 1) {
        bufferChunks.push(Buffer.from('}'));
        const finalBuffer = Buffer.concat(bufferChunks);
        const { path, size } = await write(
          game,
          version,
          langCode,
          chunkIndex,
          finalBuffer
        );
        Data[game].files.push({
          path,
          size,
          lang: langCode
        });
      }
    }
  }
}

await fs.writeFile(
  join(dirname, '../data/text/meta.json'),
  JSON.stringify(Data, null, 2)
);

await fs.cp(join(dirname, './_headers'), join(dirname, '../data/_headers'), {
  force: true
});
