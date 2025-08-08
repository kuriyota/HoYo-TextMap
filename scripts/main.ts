import fs from 'node:fs/promises';
import path from 'node:path';
const dirname = import.meta.dirname as string;
const filename = import.meta.filename as string;

await fs.cp(
  path.join(dirname, './_headers'),
  path.join(dirname, '../data/_headers'),
  { force: true, recursive: true }
);
