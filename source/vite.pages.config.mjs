import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/postcss';
import {fileURLToPath} from 'node:url';
export default defineConfig({
 base:'./',
 publicDir:'source-original/public',
 resolve:{alias:{'@':fileURLToPath(new URL('./source-original',import.meta.url))}},
 css:{postcss:{plugins:[tailwind()]}},
 plugins:[{name:'portable-original-asset-paths',enforce:'pre',transform(code,id){
  if(!id.replaceAll('\\','/').includes('/source-original/')||! /\.[jt]sx?$/.test(id))return;
  return {code:code.replace(/(["'])\/(aircraft|scenery|audio)\//g,'$1./$2/').replaceAll('href="/"','href="./"'),map:null};
 }},react()],
 build:{outDir:'playable',sourcemap:true}
});
