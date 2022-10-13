'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault(ex) {
  return ex && (typeof ex === 'undefined' ? 'undefined' : _typeof(ex)) === 'object' && 'default' in ex ? ex['default'] : ex;
}

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var redux = require('redux');

var ValidateDatetime = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])T(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9]).([0-9][0-9][0-9])Z$/;

function eachRecursive(obj) {
  var updatedObj = {};
  for (var k in obj) {
    if (Array.isArray(obj[k])) updatedObj[k] = obj[k].map(eachRecursive);else if (_typeof(obj[k]) === "object" && obj[k] !== null) updatedObj[k] = eachRecursive(obj[k]);else if (typeof obj[k] === "string") updatedObj[k] = ValidateDatetime.test(obj[k]) ? new Date(obj[k]) : obj[k];else updatedObj[k] = obj[k];
  }
  return updatedObj;
}

function smartAction(response) {

  // skip if there's no to "json" function
  if (!response || !response.json) return false;

  return new Promise(function (resolve, reject) {

    // IF you try to return the result.json and Throw inside it
    // You will get "Unhandled promise rejection"
    try {

      response.json().then(function (jsonresult) {
        if (jsonresult.errors) {
          reject(jsonresult.errors.length === 1 ? jsonresult.errors[0] : jsonresult.errors);
          //reject( new Error(jsonresult.errors.map(error => error.message).join()))
        } else if (jsonresult.errorMessage && jsonresult.errorType) {
          reject(jsonresult);
        } else {
          if (1 === Object.keys(jsonresult).length && "object" === _typeof(jsonresult.data)) resolve(jsonresult.data);else if (response && response.hasOwnProperty("ok") && !response.ok) {
            reject(response);
          } else {
            resolve(eachRecursive(jsonresult));
          }
        } // END else
      }); // END response.json()
      //.catch( e=>   resolve( response ) )
    } catch (e) {
      // this is the ONLY error that can be found
      // SyntaxError: Unexpected token < in JSON at position 0
      //if(e instanceof SyntaxError){
      resolve(response);
      //  }else {
      //    throw e;
      //  }
    }
    //  .catch((err)=>resolve(response))
  }); // END Promise
}

var files = void 0;

//const webpackModules       = files => files[files]
var webpackModules = function webpackModules(file) {
  return files[file];
};
webpackModules.keys = function () {
  return Object.keys(files);
};
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
webpackModules.clear = function () {
  files = {};
};
//webpackModules.clear = () => { console.log(files); Object.keys(files).forEach(storeName => delete files[storeName]); console.log(files);   }

webpackModules.set = function (storeName, actionFileName, actionFunctionName, actionFunction) {
  var path$$1 = './' + storeName + '/' + actionFileName + '.js';
  files[path$$1] = files[path$$1] || {};
  files[path$$1][actionFunctionName] = actionFunction;
  return files;
};

webpackModules.clear();

// var storePath = path.join(path.dirname(fs.realpathSync(__filename)), 'store');
function nodeModules(storePath) {

  storePath = path.resolve(storePath);

  var files = [];

  var webpackModules = function webpackModules(moduleName) {
    return require(path.join(storePath, moduleName)); //(storePath+"/"+moduleName)
  };
  webpackModules.keys = function () {
    return files;
  };

  webpackModules.set = function (storeName, actionFileName) {
    files.push('./' + storeName + '/' + actionFileName); //(path.join(storeName,actionFileName))
    return files;
  };

  fs.readdirSync(storePath, { withFileTypes: true }).forEach(function (dirent) {

    if ("string" === typeof dirent) {
      var name = dirent;
      dirent = {
        name: name,
        isDirectory: function isDirectory() {
          return fs.lstatSync(path.join(storePath, name)).isDirectory();
        }
      };
    }

    if (dirent.isDirectory()) {
      fs.readdirSync(path.join(storePath, dirent.name)) //(storePath+"/"+dirent.name)
      .forEach(function (actionName) {
        if ('_' !== actionName[0]) {
          webpackModules.set(dirent.name, actionName);
        }
      });
    }
  });

  return webpackModules;
}

function isFunction(value) {
  //return ({}).toString.call(value) === '[object Function]';
  return value instanceof Function;
}
function isObject(value) {
  // TODO: find out why this is braking the tests
  //return !! value && value.constructor === Object;
  return value instanceof Object && !isArray(value);
}

var isArray = Array.isArray;

function ActionIDGen(reducerName, actionName, stage) {
  if (3 === arguments.length) return "@@redux-auto/" + reducerName.toUpperCase() + "/" + actionName.toUpperCase() + "." + stage.toUpperCase();else return "@@redux-auto/" + reducerName.toUpperCase() + "/" + actionName.toUpperCase();
}

var actionsBuilder = {},
    actionsBuilderPROTOTYPES = {},
    lookup = {},
    lifecycle = {},
    isAsync = {};
var mappingFromReducerActionNameToACTIONID = {};
var reducersBeforeAutoErrorMessage = "You are trying to get reducers before calling 'auto'. Trying moving applyMiddleware BEFORE combineReducers";
var reducersAfterCombineReducersErrorMessage = "You need to pass an object of reducers to 'mergeReducers' BEFORE calling combineReducers. Try createStore( combineReducers( mergeReducers(otherReducers) ) )";
var autoWasCalled = false,
    reducers = {
  auto_function_not_call_before_combineReducers: function auto_function_not_call_before_combineReducers() {
    throw new Error(reducersBeforeAutoErrorMessage);
  }
};
function chaining(actionType) {

  var result = chaining[actionType] && chaining[actionType]();

  result && result.then && result.then(function (action) {
    if (action && isObject(action) && action.type && action.payload) {
      setTimeout(function () {
        return chaining.dispatcher(action);
      }, 0); //TODO: is this timeout need?
    }
  });
}

chaining.set = function (fn, actionType, argsArray) {
  if (undefined === fn) return;
  chaining[actionType] = function () {

    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        resolve(0 < fn.length ? fn.apply(undefined, _toConsumableArray(argsArray)) : fn());
      }, 0);
    });
  };
};

var settingsOptions = {},
    testingOptions = {};
var inits = [];

function reset() {
  Object.keys(settingsOptions).forEach(function (p) {
    return delete settingsOptions[p];
  });
  Object.keys(testingOptions).forEach(function (p) {
    return delete testingOptions[p];
  });
  Object.keys(actionsBuilder).forEach(function (p) {
    return delete actionsBuilder[p];
  });
  Object.keys(reducers).forEach(function (p) {
    return delete reducers[p];
  });
  Object.keys(lookup).forEach(function (p) {
    return delete lookup[p];
  });
  Object.keys(lifecycle).forEach(function (p) {
    return delete lifecycle[p];
  });
  Object.keys(mappingFromReducerActionNameToACTIONID).forEach(function (p) {
    return delete mappingFromReducerActionNameToACTIONID[p];
  });
  inits = [];
} // END reset

function mergeReducers(otherReducers) {
  if (!autoWasCalled) throw new Error(reducersBeforeAutoErrorMessage);
  if (isFunction(otherReducers)) throw new Error(reducersAfterCombineReducersErrorMessage);
  return Object.assign({}, otherReducers, reducers);
} // END mergeReducers

function names(key) {
  if (undefined === names[key]) {
    names[key] = {
      actionName: key.match(/([^\/]+)(?=\.\w+$)/)[0],
      reducerName: key.match(/(.*)[\/\\]/)[1].substring(2)
    };
  }
  return names[key];
}

function buildActionLayout(fileNameArray) {

  fileNameArray.forEach(function (key) {
    var _names = names(key),
        actionName = _names.actionName,
        reducerName = _names.reducerName;

    // get action name starts with _ skip it


    if ("_" === actionName[0] || null === reducerName || "index" === actionName) return;
    actionsBuilderPROTOTYPES[reducerName] = {}; // this is used of, e.g: if(action.type in actions.users) ~ trying to see if an type map to the reducer
    actionsBuilder[reducerName] = actionsBuilder[reducerName] || Object.create(actionsBuilderPROTOTYPES[reducerName]);
    actionsBuilder[reducerName][actionName] = function () {
      var _actionsBuilder$reduc;

      return (_actionsBuilder$reduc = actionsBuilder[reducerName])[actionName].apply(_actionsBuilder$reduc, arguments);
    };
    actionsBuilder[reducerName][actionName].clear = function () {
      var _actionsBuilder$reduc2;

      return (_actionsBuilder$reduc2 = actionsBuilder[reducerName][actionName]).clear.apply(_actionsBuilder$reduc2, arguments);
    };
  });
} // END buildActionLayout

function auto(modules, fileNameArray, settings) {

  if ("object" === (typeof modules === 'undefined' ? 'undefined' : _typeof(modules)) && arguments.length === 1) {
    Object.keys(modules).forEach(function (reducers) {
      Object.keys(modules[reducers]).forEach(function (actionName) {
        Object.keys(modules[reducers][actionName]).forEach(function (fnType) {
          webpackModules.set(reducers, actionName, fnType, modules[reducers][actionName][fnType]);
        });
      });
    });
    return auto(webpackModules, webpackModules.keys());
  } // END if

  autoWasCalled = true;
  //reset();
  delete reducers.auto_function_not_call_before_combineReducers;
  if (!settings || settings.skipBuildActionLayout) {
    //default is to buildActionLayout
    buildActionLayout(fileNameArray);
  }

  if (testingOptions.preOnly) return;

  var actionsImplementation = fileNameArray.reduce(function (actionsImplementation, key) {
    var _names2 = names(key),
        actionName = _names2.actionName,
        reducerName = _names2.reducerName;

    if (actionName.substr(-".test".length) === ".test" || actionName.substr(-".test.js".length) === ".test.js") {
      return actionsImplementation;
    }

    if (0 <= actionName.indexOf(".")) throw new Error('file ' + actionName + ' in ' + reducerName + ' contains a DOT in its name');
    if (0 <= reducerName.indexOf(".")) throw new Error('the folder ' + reducerName + ' contains a DOT in its name');

    // get action name starts with _ skip it
    if ("_" === actionName[0] || null === reducerName) return actionsImplementation;

    lookup[reducerName] = lookup[reducerName] || {};
    lookup[reducerName][actionName] = modules(key).default || {};
    lookup[reducerName][actionName].pending = modules(key).pending || modules(key).PENDING;
    lookup[reducerName][actionName].fulfilled = modules(key).fulfilled || modules(key).FULFILLED;
    lookup[reducerName][actionName].rejected = modules(key).rejected || modules(key).REJECTED;

    isAsync[reducerName] = isAsync[reducerName] || !!modules(key).action;

    lifecycle[reducerName] = lifecycle[reducerName] || { // defaults
      before: function defaultBefore(oldstate, action) {
        return action.payload;
      },
      after: function defaultAfter(updatedState, action, oldState) {
        return updatedState;
      }
    };

    if ("index" === actionName) {
      lifecycle[reducerName].after = modules(key).after || modules(key).AFTER || lifecycle[reducerName].after;
      lifecycle[reducerName].before = modules(key).before || modules(key).BEFORE || lifecycle[reducerName].before;
    }

    var ACTIONID = ActionIDGen(reducerName, actionName);
    mappingFromReducerActionNameToACTIONID[reducerName] = mappingFromReducerActionNameToACTIONID[reducerName] || {};
    mappingFromReducerActionNameToACTIONID[reducerName][ACTIONID] = actionName;

    if (!(reducerName in reducers)) {
      reducers[reducerName] = function (data, action) {

        var avabileActions = lookup[reducerName];
        var actionFragments = action.type.split(".");

        var avabileAction = mappingFromReducerActionNameToACTIONID[reducerName][actionFragments[0]];

        var payload = lifecycle[reducerName].before(data, action);

        // redux-auto ALLOWS has an object payload (other like '@@redux/INIT' will not)
        // before should return a payload object
        //if("object" === typeof action.payload && "object" !== typeof payload)//
        if (isObject(action.payload) && !isObject(payload)) throw new Error(reducerName + '-before returned a "' + (typeof payload === 'undefined' ? 'undefined' : _typeof(payload)) + '" should be a payload object');

        var newState = data;
        var newAsyncVal = false;
        var async = data ? data.__proto__.async : {};

        if (avabileAction in avabileActions) {

          if (actionFragments.length === 2) {

            newAsyncVal = true;
            var stage = actionFragments[1].toLowerCase();

            async = Object.assign({}, async);

            if ("clear" === stage) {
              async[avabileAction] = undefined;
            } else {

              var clearFn = void 0;
              if ("rejected" === stage) {
                clearFn = payload.clear;
                delete payload.clear;
              }

              //    if(  stage === "pending" || stage === "fulfilled" || stage === "rejected" ){
              if (isFunction(lookup[reducerName][avabileAction][stage])) {
                var _lookup$reducerName$a;

                var argsArray = [data, action.reqPayload, payload];
                newState = (_lookup$reducerName$a = lookup[reducerName][avabileAction])[stage].apply(_lookup$reducerName$a, argsArray);
                chaining.set(lookup[reducerName][avabileAction][stage].chain, action.type, argsArray);
              } else {
                var _lookup$reducerName;

                var _argsArray = [data, action.reqPayload, actionFragments[1], payload];
                newState = (_lookup$reducerName = lookup[reducerName])[avabileAction].apply(_lookup$reducerName, _argsArray);
                chaining.set(lookup[reducerName][avabileAction].chain, action.type, _argsArray);
              } // END else

              async[avabileAction] = stage === "pending" ? true : stage === "fulfilled" ? false : payload;

              if (clearFn) //(async[avabileAction] instanceof Error){
                async[avabileAction].clear = clearFn;
            } // END else "clear" !== stage
          } else {
            var _lookup$reducerName2;

            var _argsArray2 = [data, payload];
            newState = (_lookup$reducerName2 = lookup[reducerName])[avabileAction].apply(_lookup$reducerName2, _argsArray2);
            chaining.set(lookup[reducerName][avabileAction].chain, action.type, _argsArray2);
          }
        } else {
          // if("index" in lookup[reducerName]){

          newState = lookup[reducerName].index(data, Object.assign({}, action, { payload: payload }));
        }

        newState = lifecycle[reducerName].after(newState, action, data);

        // check if newState's prototype is the shared Object?
        //console.log (action.type, newState, ({}).__proto__ === newState.__proto__)


        if (newAsyncVal || newState && isAsync[reducerName] && !newState.__proto__.async) {

          if (isObject(newState)) {

            var _newProto_ = {};
            Object.defineProperty(_newProto_, "async", { enumerable: false, writable: false, value: async });
            Object.defineProperty(_newProto_, "loading", { enumerable: false, writable: false, value: async });

            //const newStateWithAsync = Object.create(Object.assign(Object.create(newState.__proto__),{async}));
            var newStateWithAsync = Object.create(_newProto_);
            newState = Object.assign(newStateWithAsync, newState); // clone object
          } else if (isArray(newState)) {
            // I am a redux-auto proto
            var _newProto_2 = Object.create(Array.prototype);

            Object.defineProperty(_newProto_2, "async", { enumerable: false, writable: false, value: async });
            Object.defineProperty(_newProto_2, "loading", { enumerable: false, writable: false, value: async });

            newState = newState.slice(0); // clone array

            newState.__proto__ = _newProto_2;
          } // END isArray
        } // END if(newAsyncVal)

        return newState;
      }; // END reducers[reducerName] = (data, action) => {
    } // END !(reducerName in reducers)

    // !! index reduers DONT get to overload the action.. sorry :) !!
    if ("index" !== actionName) {

      var actionPreProcessor = modules(key).action;
      // actionsBuilder[reducerName] = actionsBuilder[reducerName] || {};

      actionsImplementation[reducerName] = actionsImplementation[reducerName] || Object.create(actionsBuilderPROTOTYPES[reducerName]);

      actionsImplementation[reducerName][actionName] = function (payload, getState) {
        //actionsBuilder[reducerName][actionName] = (payload,getState) => {

        if (actionPreProcessor) {
          if (1 < actionPreProcessor.length) {
            return { type: ACTIONID, payload: actionPreProcessor(payload, getState()[reducerName]) };
          } // else
          return { type: ACTIONID, payload: actionPreProcessor(payload) };
        } // else
        return { type: ACTIONID, payload: payload };
      }; // END actionsBuilder[reducerName][actionName] = (payload = {}) => {
    } // END if(actionName !== "index")
    return actionsImplementation;
  }, {}); //END reduce

  //+++++++ replace the place-holders after fully loaded
  //++++++++++++++++++++++++++++++++++++++++++++++++++++

  Object.assign(actionsBuilder, actionsImplementation);

  //+++++++++++++++++++++++++ wrap actions with dispatch
  //++++++++++++++++++++++++++++++++++++++++++++++++++++

  return function setDispatch(_ref) {
    var getState = _ref.getState,
        dispatch = _ref.dispatch;


    chaining.dispatcher = dispatch;

    Object.keys(actionsBuilder).forEach(function (reducerName) {

      Object.keys(actionsBuilder[reducerName]).forEach(function (actionName) {
        // hold a ref to the root Fn
        var actionDataFn = actionsBuilder[reducerName][actionName];
        // replace the mapping object pointer the wrappingFn
        actionsBuilder[reducerName][actionName] = function () {
          var payload = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


          if (arguments.length > 0 && undefined === arguments[0] || !isObject(payload)) {
            throw new Error(_typeof(arguments[0]) + ' was passed as payload to ' + reducerName + '.' + actionName + '. This need to be an object. Check you have not misspelled of the variable');
          }

          var wrappingFn = actionsBuilder[reducerName][actionName];

          var actionOutput = actionDataFn(payload, getState);
          //should be able to cancel an action by returning undefined from the action
          if (undefined === actionOutput.payload) {
            return;
          } else if (isObject(actionOutput.payload)) {
            if (isFunction(actionOutput.payload.then)) {

              wrappingFn.pending = ActionIDGen(reducerName, actionName, "pending");
              wrappingFn.fulfilled = ActionIDGen(reducerName, actionName, "fulfilled");
              wrappingFn.rejected = ActionIDGen(reducerName, actionName, "rejected");
              var clearType = ActionIDGen(reducerName, actionName, "clear");
              wrappingFn.clear = function () {
                return dispatch({ type: clearType });
              };
              wrappingFn.clear.toString = function () {
                return clearType;
              };
              actionsBuilderPROTOTYPES[reducerName][wrappingFn.pending] = actionName;
              actionsBuilderPROTOTYPES[reducerName][wrappingFn.fulfilled] = actionName;
              actionsBuilderPROTOTYPES[reducerName][wrappingFn.rejected] = actionName;
              actionsBuilderPROTOTYPES[reducerName][clearType] = actionName;

              dispatch({ type: wrappingFn.pending, reqPayload: payload, payload: null });
              chaining(wrappingFn.pending);

              var handleErrors = function handleErrors(err) {
                // only handle external error
                err.clear = function () {
                  dispatch({ type: clearType });
                };
                dispatch({ type: wrappingFn.rejected, reqPayload: payload, payload: err });
                chaining(wrappingFn.rejected);
              };

              actionOutput.payload.then(function (result) {
                if (settings && true === settings.smartActions || true === settingsOptions.smartActions) {
                  var smartActionOutPut = smartAction(result);
                  if (smartActionOutPut) {
                    smartActionOutPut.then(function (grafeQLPayload) {
                      dispatch({ type: wrappingFn.fulfilled, reqPayload: payload, payload: grafeQLPayload });
                      chaining(wrappingFn.fulfilled);
                    }).catch(function (errors) {
                      if (Array.isArray(errors)) {
                        errors.forEach(handleErrors);
                      } else {
                        handleErrors(errors);
                      }
                    });
                    return;
                  } else if (result.hasOwnProperty("ok") && !result.ok) {
                    handleErrors(result);
                    return;
                  }
                } // END settingsOptions.smartActions

                dispatch({ type: wrappingFn.fulfilled, reqPayload: payload, payload: result });
                chaining(wrappingFn.fulfilled);
              }, handleErrors).catch(handleErrors);
            } else {
              dispatch(actionOutput);
              chaining(actionOutput.type);
            }
          } else {
            // if(undefined === actionOutput.payload)
            // because an action-middlware my set a simple value
            throw new Error("action with bad payload:" + actionOutput.type + " >> " + JSON.stringify(actionOutput.payload));
          }
        }; // END actionsBuilder[reducerName][actionName] = (payload = {}) =>
        var ACTIONID = ActionIDGen(reducerName, actionName);
        actionsBuilder[reducerName][actionName].toString = function () {
          return ACTIONID;
        };
        actionsBuilderPROTOTYPES[reducerName][ACTIONID] = actionName; // a reverse mapping
        //Object.freeze(actionDataFn)
        //actionDataFn.valueOf  = () => Symbol(ACTIONID); // double equales: (()=>{}) == Symbol *true
      });
      // if there is an initialization action, fire it!!
      var init = actionsBuilder[reducerName].init || actionsBuilder[reducerName].INIT;
      if (isFunction(init) && actionsImplementation[reducerName]) {
        inits.push(init);
      }
    }); // END forEach
    setTimeout(function () {
      if (inits.length) {
        inits.forEach(function (init) {
          return init({});
        });
      }
    }, 0); // END setTimeout
    return function (next) {
      return function (action) {
        return next(action);
      };
    };
  }; // END setDispatch
} // END of auto

function waitOfInitStore(store, timeToWait, limitStoreToLoad) {

  return new Promise(function (resolve, reject) {

    var reducerWithInits = limitStoreToLoad.reduce(function (all, path$$1) {
      var _names3 = names(path$$1),
          actionName = _names3.actionName,
          reducerName = _names3.reducerName;

      if ("INIT" === actionName.toUpperCase()) {
        all.push(reducerName);
      }
      return all;
    }, []); // END reduce

    var timeout = setTimeout(function () {
      reject(new Error('Store setup is taking to long! ' + reducerWithInits.join() + ' init' + (reducerWithInits.length > 1 ? "s" : "") + ' did NOT complete'));
    }, timeToWait);

    store.lesionForActions(function (_ref2) {
      var type = _ref2.type;

      if (type.endsWith("INIT.FULFILLED")) {
        reducerWithInits = reducerWithInits.filter(function (reducerWithInit) {
          return !type.includes(('/' + reducerWithInit + '/').toUpperCase());
        });
      }
      if (0 === reducerWithInits.length) {
        clearTimeout(timeout);
        resolve(store);
      }
    }); // END store.lesionForActions
  }); // END new Promise
} // END waitOfInitStore

function filterSubStore(fileNameArray, loadSubStore) {
  return fileNameArray.filter(function (fileName) {
    return loadSubStore.some(function (name) {
      return fileName.includes(name + '/') || fileName.includes(name + '\\');
    });
  });
} // END filterSubStore

auto.reset = reset;
auto.settings = function settings(options) {
  Object.assign(settingsOptions, options);
};

auto.testing = function testing(options) {
  Object.assign(testingOptions, options);
};

// Just calling genStore() without args, will load the complete store
function genStore(webpackModules$$1, subStoreToLoad, waitTime) {
  reset();
  var webpackModulesKeys = webpackModules$$1.keys();
  var limitStoreToLoad = 1 === arguments.length ? webpackModulesKeys : filterSubStore(webpackModulesKeys, subStoreToLoad);
  buildActionLayout(webpackModulesKeys);
  var middleware = redux.applyMiddleware(auto(webpackModules$$1, limitStoreToLoad, { skipBuildActionLayout: true }));
  var cbs = [];
  var store = redux.createStore(redux.combineReducers(Object.assign({}, reducers, {
    checkIfAllActions_init_fulfilled: function checkIfAllActions_init_fulfilled(state, action) {
      cbs.forEach(function (cb) {
        return cb(action);
      });
      return null;
    }
  })), middleware);
  store.lesionForActions = function (cb) {
    cbs.push(cb);
  };
  return waitOfInitStore(store, waitTime, limitStoreToLoad);
} // END genStore

exports.default = actionsBuilder;
exports.auto = auto;
exports.mergeReducers = mergeReducers;
exports.reducers = reducers;
exports.filterSubStore = filterSubStore;
exports.waitOfInitStore = waitOfInitStore;
exports.fsModules = nodeModules;
exports.genStore = genStore;
