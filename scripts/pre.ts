import { copy } from "jsr:@std/fs";
import { join } from "jsr:@std/path";
import { mergeSplitTextMaps } from "./merge.ts";
const dirname = import.meta.dirname as string;

export const pre = async () => {
  await copy(
    join(dirname, "../AnimeGameData/TextMap"),
    join(dirname, "../text-map-raw/Genshin"),
    {
      overwrite: true,
    },
  );
  await copy(
    join(dirname, "../TurnBasedGameData/TextMap"),
    join(dirname, "../text-map-raw/StarRail"),
    {
      overwrite: true,
    },
  );

  const SRFiles = Deno.readDir(join(dirname, "../TurnBasedGameData/TextMap"));
  for await (const file of SRFiles) {
    if (file.isFile && file.name.indexOf("Main") != -1) {
      await Deno.remove(
        join(dirname, "../text-map-raw/StarRail/", file.name),
      );
    }
  }

  await mergeSplitTextMaps(join(dirname, "../text-map-raw/Genshin"));
  await mergeSplitTextMaps(join(dirname, "../text-map-raw/StarRail"));
};
