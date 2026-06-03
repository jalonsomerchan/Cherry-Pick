import { cp, mkdir, rm } from 'node:fs/promises';

const files = ['index.html', 'manifest.webmanifest', 'robots.txt', 'favicon.svg', '.nojekyll'];
const dirs = ['assets', 'src', 'en'];

await rm('dist', { force: true, recursive: true });
await mkdir('dist', { recursive: true });

for (const file of files) {
  await cp(file, `dist/${file}`);
}

for (const dir of dirs) {
  await cp(dir, `dist/${dir}`, { recursive: true });
}
