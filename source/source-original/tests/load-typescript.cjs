const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const cache=new Map();
function load(file,extra={}){
 const filename=path.resolve(file);if(cache.has(filename))return cache.get(filename);
 const module={exports:{}};cache.set(filename,module.exports);
 const sandbox={module,exports:module.exports,Math,console,...extra,require(id){if(id.startsWith('.'))return load(path.resolve(path.dirname(filename),id+'.ts'),extra);return require(id)}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,sandbox,{filename});
 return module.exports;
}
module.exports={load};
