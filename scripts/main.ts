import { join } from "jsr:@std/path";
import { copy } from "jsr:@std/fs";
import { getLanguageMetaFromFilename } from "./lang.ts";
import { pre } from "./pre.ts";
const dirname = import.meta.dirname as string;

await pre();

const games = ["Genshin", "StarRail"];
const Data: Record<string, {
  files: {
    name: string;
    lang: string;
    size: number;
  }[];
  version: string;
  updated: string;
}> = {};

const GenshinVersion = "4.7";
const StarRailVersion = "2.4";

await Deno.mkdir(join(dirname, "../data"));

let totalFile = 0;
let fileCount = 0;
for (const game of games) {
  const dir = Deno.readDir(join(dirname, "../text-map-raw", game));
  for await (const entry of dir) {
    if (entry.isFile) {
      totalFile++;
    }
  }
}

for (const game of games) {
  const dir = Deno.readDir(join(dirname, "../text-map-raw", game));
  Data[game] = {
    files: [],
    version: game === "Genshin" ? GenshinVersion : StarRailVersion,
    updated: new Date().toISOString(),
  };
  for await (const entry of dir) {
    if (entry.isFile) {
      const file = await Deno.readTextFile(
        join(dirname, "../text-map-raw", game, entry.name),
      );
      const json = JSON.parse(file) as Record<string, string>;
      const data = Object.entries(json);
      const lang = getLanguageMetaFromFilename(entry.name);
      const length = data.length;
      // 分成 10 片
      let index = 0;
      for (let i = 0; i < length; i += length / 10) {
        const chunk = data.slice(i, Math.min(length, i + length / 10));
        const chunkJson = Object.fromEntries(chunk);
        const filename = `${game}.${lang?.lang}.${index++}.json`;
        const pathname = join(
          dirname,
          "../data",
          filename,
        );
        await Deno.writeTextFile(
          pathname,
          JSON.stringify(chunkJson, null, 2),
        );
        const filesize = (await Deno.stat(pathname)).size;
        Data[game].files.push({
          name: filename,
          size: filesize,
          lang: lang?.lang || "",
        });
        fileCount++;
        console.log(
          `Wrote ${filename} (${filesize} bytes) ${fileCount}/${
            totalFile * 10
          } ${fileCount / totalFile * 10}`,
        );
      }
    }
  }
}

await Deno.writeTextFile(
  join(
    dirname,
    "../data/Data.json",
  ),
  JSON.stringify(Data, null, 2),
);
await copy(
  join(dirname, "./_headers"),
  join(dirname, "../data/_headers"),
  {
    overwrite: true,
  },
);