

let files;

//const webpackModules       = files => files[files]
const webpackModules       = function(file){ return files[file] }
      webpackModules.keys  = () => Object.keys(files)
    /*  webpackModules.reset = () => {
        files = {
         "./user/changeName.js": {
                pending:function(x){   return x       },
                fulfilled:function(x){   return x  },
                rejected:function(x){   return x   },
                action:function(x){   return x     }
              },
         "./user/index.js":{
                //before:function(x){   return x   },
                default:function(user = {name:"bob"}){    return user     },
                after:function(x){   return x     }
              },
         "./user/init.js":{
                default:function(user = {name:"tom"}){    return user     },
                action:function(x){   return x     }
              }
        }
        return files;
      }*/
      webpackModules.clear = () => { files = {}  }
      //webpackModules.clear = () => { console.log(files); Object.keys(files).forEach(storeName => delete files[storeName]); console.log(files);   }

      webpackModules.set = function(storeName,actionFileName,actionFunctionName,actionFunction){
        const path = `./${storeName}/${actionFileName}.js`;
        files[path] = files[path] || {}
        files[path][actionFunctionName] = files[path][actionFunctionName] || {}
        files[path][actionFunctionName] = actionFunction;
        return files;
      }

webpackModules.clear();
//webpackModules.reset();

export default webpackModules;
