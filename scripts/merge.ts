import fs from 'node:fs/promises';
import path from 'node:path';
const dirname = import.meta.dirname as string;
const filename = import.meta.filename as string;

export async function mergeSplitTextMaps(directory: string): Promise<void> {
  // 存储发现的所有TextMap文件，按语言分组
  const textMaps: Record<string, { name: string; files: string[] }> = {};

  // 遍历目录查找所有TextMap文件
  for await (const entry of await fs.opendir(directory)) {
    const filename = entry.name;

    // 匹配TextMap{语言代码}[_分片编号].json格式
    const match = filename.match(/^TextMap([A-Z]{2,3})(?:_(\d+))?\.json$/i);
    if (!match) continue;

    const langCode = match[1].toUpperCase();
    const fragmentNum = match[2] ? parseInt(match[2]) : null;

    // 初始化语言组
    if (!textMaps[langCode]) {
      textMaps[langCode] = {
        name: `TextMap${langCode}.json`,
        files: []
      };
    }

    // 按分片编号排序添加文件
    if (fragmentNum !== null) {
      textMaps[langCode].files[fragmentNum] = entry.parentPath;
    } else {
      // 如果没有分片编号，作为主文件
      textMaps[langCode].files.unshift(entry.parentPath);
    }
  }

  // 处理每个语言组
  for (const [langCode, group] of Object.entries(textMaps)) {
    // 过滤掉空槽（稀疏数组）
    const fragmentFiles = group.files.filter(Boolean);

    // 如果没有分片文件，跳过
    if (fragmentFiles.length <= 1) {
      console.log(`No fragments found for ${group.name}, skipping...`);
      continue;
    }

    console.log(
      `Merging ${fragmentFiles.length} fragments for ${group.name}...`
    );

    // 合并所有分片
    const mergedMap: Record<string, string> = {};

    for (const filePath of fragmentFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const json = JSON.parse(content);
        fs.rm(filePath);

        // 合并键值对（后面的分片会覆盖前面的）
        Object.assign(mergedMap, json);
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }

    // 写入合并后的文件
    const outputPath = path.join(directory, group.name);
    await fs.writeFile(outputPath, JSON.stringify(mergedMap, null, 2), 'utf-8');
    console.log(`Merged ${group.name} created at ${outputPath}`);
  }
}
