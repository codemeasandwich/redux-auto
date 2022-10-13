
import fs from 'fs';
import path from 'path'
// var storePath = path.join(path.dirname(fs.realpathSync(__filename)), 'store');
function nodeModules(storePath){
  
  storePath = path.resolve(storePath)
  
  let files = [];

  const webpackModules = function(moduleName){
    return require(path.join(storePath,moduleName))//(storePath+"/"+moduleName)
    }
        webpackModules.keys  = () => files

        webpackModules.set = function(storeName,actionFileName){
          files.push(`./${storeName}/${actionFileName}`);//(path.join(storeName,actionFileName))
          return files;
        }

  fs.readdirSync(storePath,{withFileTypes:true}).forEach(dirent => {
    
    if("string" === typeof dirent){
      const name = dirent
      dirent = {
        name,
        isDirectory:()=>fs.lstatSync(path.join(storePath,name)).isDirectory()
      }
    }
    
    if(dirent.isDirectory()){
      fs.readdirSync(path.join(storePath,dirent.name))//(storePath+"/"+dirent.name)
        .forEach(actionName => {
        if('_' !== actionName[0]){
          webpackModules.set(dirent.name,actionName)
        }
      })
    }
  })

  return webpackModules
}

export default nodeModules
