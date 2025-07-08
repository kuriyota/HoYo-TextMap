
# HoYo Text Map

Cloudflare Pages 自动部署。

支持 Genshin (原神), Honkai: Star Rail (崩坏：星穹铁道)。

`https://hoyo-textmap.pages.dev/meta.json`

```ts
const Meta: Record<string, {
  files: {
    name: string;
    lang: string;
    size: number;
  }[];
  version: string;
  updated: string;
}> = {};
```