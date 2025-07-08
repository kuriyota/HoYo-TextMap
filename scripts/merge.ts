
// by DeepSeek V3

import { walk } from "@std/fs";
import { join, basename } from "@std/path";

/**
 * 合并分片的TextMap文件
 * @param directory 要扫描的目录路径
 */
export async function mergeSplitTextMaps(directory: string): Promise<void> {
    // 存储发现的所有TextMap文件，按语言分组
    const textMaps: Record<string, {name: string; files: string[]}> = {};

    // 遍历目录查找所有TextMap文件
    for await (const entry of walk(directory, { exts: [".json"] })) {
        const filename = basename(entry.path);
        
        // 匹配TextMap{语言代码}[_分片编号].json格式
        const match = filename.match(/^TextMap([A-Z]{2})(?:_(\d+))?\.json$/i);
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
            textMaps[langCode].files[fragmentNum] = entry.path;
        } else {
            // 如果没有分片编号，作为主文件
            textMaps[langCode].files.unshift(entry.path);
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

        console.log(`Merging ${fragmentFiles.length} fragments for ${group.name}...`);
        
        // 合并所有分片
        const mergedMap: Record<string, string> = {};
        
        for (const filePath of fragmentFiles) {
            try {
                const content = await Deno.readTextFile(filePath);
                const json = JSON.parse(content);
                Deno.remove(filePath);

                // 合并键值对（后面的分片会覆盖前面的）
                Object.assign(mergedMap, json);
            } catch (error) {
                console.error(`Error processing ${filePath}:`, error);
            }
        }

        // 写入合并后的文件
        const outputPath = join(directory, group.name);
        await Deno.writeTextFile(outputPath, JSON.stringify(mergedMap, null, 2));
        console.log(`Merged ${group.name} created at ${outputPath}`);
    }
}