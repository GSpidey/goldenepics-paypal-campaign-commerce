import {readFile,writeFile} from 'node:fs/promises';
const assets={index:'../public/index.html',app:'../public/app.js',style:'../public/style.css',setup:'./setup.html'};
const code=await Promise.all(Object.entries(assets).map(async([name,path])=>'export const '+name+'='+JSON.stringify(await readFile(new URL(path,import.meta.url),'utf8'))+';'));
await writeFile(new URL('./assets.generated.mjs',import.meta.url),code.join('\n')+'\n');
