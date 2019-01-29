
import fs from 'fs';
// var storePath = path.join(path.dirname(fs.realpathSync(__filename)), 'store');
function nodeModules(storePath){

  let files = [];

  const webpackModules       = function(path){ return require(storePath+"/"+path) }
        webpackModules.keys  = () => files

        webpackModules.set = function(storeName,actionFileName){
          files.push(`./${storeName}/${actionFileName}`);
          return files;
        }

  fs.readdirSync(storePath,{withFileTypes:true}).forEach(dirent => {
    if(dirent.isDirectory()){
      fs.readdirSync(storePath+"/"+dirent.name).forEach(actionName => {
        if('_' !== actionName[0]){
          webpackModules.set(dirent.name,actionName)
        }
      })
    }
  })

  return webpackModules
}

export default nodeModules
