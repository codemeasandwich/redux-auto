/**
//========================================== redux-auto
//======= https://github.com/codemeasandwich/redux-auto
*/

import smartAction from './middleware/smartActions.js';

function isFunction(value){
//return ({}).toString.call(value) === '[object Function]';
  return value instanceof Function;
}
function isObject(value){
  // TODO: find out why this is braking the tests
  //return !! value && value.constructor === Object;
  return value instanceof Object && !isArray(value);
}

const isArray = Array.isArray;

function ActionIDGen (reducerName, actionName, stage){
  if (3 === arguments.length)
    return "@@redux-auto/"+reducerName.toUpperCase() + "/" + actionName.toUpperCase() + "." + stage.toUpperCase();
  else
    return "@@redux-auto/"+reducerName.toUpperCase() + "/" + actionName.toUpperCase();
}

const actionsBuilder = {}, actionsBuilderPROTOTYPES = {}, lookup = {}, lifecycle = {}, isAsync={}
const mappingFromReducerActionNameToACTIONID = {};
const reducersBeforeAutoErrorMessage = "You are trying to get reducers before calling 'auto'. Trying moving applyMiddleware BEFORE combineReducers";
const reducersAfterCombineReducersErrorMessage = "You need to pass an object of reducers to 'mergeReducers' BEFORE calling combineReducers. Try createStore( combineReducers( mergeReducers(otherReducers) ) )";
let autoWasCalled = false, reducers = {
  auto_function_not_call_before_combineReducers: ()=>{
    throw new Error(reducersBeforeAutoErrorMessage);
  }
}
function chaining(actionType){
  chaining[actionType] && chaining[actionType]();
}
chaining.set = function(fn,actionType, argsArray){
  if (undefined === fn) return;
  chaining[actionType] = ()=>setTimeout(()=> (0 < fn.length) ? fn(...argsArray) : fn(), 0)
}

const settingsOptions = {}, testingOptions = {};

function reset(){
  Object.keys(settingsOptions).forEach(p => delete settingsOptions[p]);
  Object.keys(testingOptions).forEach(p => delete testingOptions[p]);
  Object.keys(actionsBuilder).forEach(p => delete actionsBuilder[p]);
  Object.keys(reducers).forEach(p => delete reducers[p]);
  Object.keys(lookup).forEach(p => delete lookup[p]);
  Object.keys(lifecycle).forEach(p => delete lifecycle[p]);
  Object.keys(mappingFromReducerActionNameToACTIONID).forEach(p => delete mappingFromReducerActionNameToACTIONID[p]);
} // END reset

function mergeReducers(otherReducers){
  if(!autoWasCalled)
    throw new Error(reducersBeforeAutoErrorMessage)
  if(isFunction(otherReducers))
    throw new Error(reducersAfterCombineReducersErrorMessage)
  return Object.assign({},otherReducers, reducers);
} // END mergeReducers

function names(key) {
  if (undefined === names[key]) {
    names[key] = {
      actionName:key.match(/([^\/]+)(?=\.\w+$)/)[0],
      reducerName:key.match(/(.*)[\/\\]/)[1].substring(2)
    }
  }
  return names[key]
}

function buildActionLayout(fileNameArray){

    fileNameArray.forEach(function(key){
      const {actionName, reducerName } = names(key);

      // get action name starts with _ skip it
      if("_" === actionName[0] || null === reducerName || "index" === actionName)
          return;
      actionsBuilderPROTOTYPES[reducerName] = {} // this is used of, e.g: if(action.type in actions.users) ~ trying to see if an type map to the reducer
      actionsBuilder[reducerName] = actionsBuilder[reducerName] ||  Object.create(actionsBuilderPROTOTYPES[reducerName]);
      actionsBuilder[reducerName][actionName] = (...args) => actionsBuilder[reducerName][actionName](...args);
      actionsBuilder[reducerName][actionName].clear = (...args) => actionsBuilder[reducerName][actionName].clear(...args);
  })
} // END buildActionLayout

 function auto (modules, fileNameArray){

   autoWasCalled = true;
   //reset();
  delete reducers.auto_function_not_call_before_combineReducers;
  buildActionLayout(fileNameArray);

  if(testingOptions.preOnly) return;

  const actionsImplementation = fileNameArray.reduce((actionsImplementation, key)=>{

  const { actionName, reducerName } = names(key);

  if(actionName.includes("."))
      throw new Error(`file ${actionName} in ${reducerName} contains a DOT in its name`)
  if(reducerName.includes("."))
      throw new Error(`the folder ${reducerName} contains a DOT in its name`)

  // get action name starts with _ skip it
  if("_" === actionName[0] || null === reducerName)
      return actionsImplementation;

  lookup[reducerName] = lookup[reducerName] || {};
  lookup[reducerName][actionName] = modules(key).default || {};
  lookup[reducerName][actionName].pending   = modules(key).pending   || modules(key).PENDING;
  lookup[reducerName][actionName].fulfilled = modules(key).fulfilled || modules(key).FULFILLED;
  lookup[reducerName][actionName].rejected  = modules(key).rejected  || modules(key).REJECTED;

  isAsync[reducerName] = isAsync[reducerName]||!!modules(key).action

  lifecycle[reducerName] = lifecycle[reducerName] || { // defaults
    before : function defaultBefore(   oldstate, action)           { return action.payload },
    after  : function defaultAfter(updatedState, action, oldState) { return updatedState }
  };

  if ("index" === actionName) {
    lifecycle[reducerName].after  = modules(key).after  || modules(key).AFTER  || lifecycle[reducerName].after;
    lifecycle[reducerName].before = modules(key).before || modules(key).BEFORE || lifecycle[reducerName].before;
  }

  const ACTIONID = ActionIDGen(reducerName, actionName);
  mappingFromReducerActionNameToACTIONID[reducerName] = mappingFromReducerActionNameToACTIONID[reducerName] || {}
  mappingFromReducerActionNameToACTIONID[reducerName][ACTIONID] = actionName;

  if(!(reducerName in reducers)){
    reducers[reducerName] = (data, action) => {

      const avabileActions = lookup[reducerName];
      const actionFragments = action.type.split(".");

      const avabileAction = mappingFromReducerActionNameToACTIONID[reducerName][actionFragments[0]];

      const payload = lifecycle[reducerName].before(data, action);

      // redux-auto ALLOWS has an object payload (other like '@@redux/INIT' will not)
      // before should return a payload object
      //if("object" === typeof action.payload && "object" !== typeof payload)//
      if( isObject(action.payload) && ! isObject(payload))
      throw new Error(`${reducerName}-before returned a "${typeof payload}" should be a payload object`)

      let newState = data;
      let newAsyncVal = !!(data && data.__proto__.async);
      let async = (newAsyncVal)?data.__proto__.async : {};

      if(avabileAction in avabileActions){

        if(actionFragments.length === 2){

          newAsyncVal = true;
          const stage = actionFragments[1].toLowerCase();

          async = (data && data.__proto__.async)?data.__proto__.async : {};
          async = Object.assign({}, async);

          if( "clear" === stage ){
            async[avabileAction] = undefined;
          } else {

                let clearFn;
                if( "rejected" === stage ){
                  clearFn = payload.clear;
                  delete payload.clear;
                }

              //    if(  stage === "pending" || stage === "fulfilled" || stage === "rejected" ){
                if (isFunction(lookup[reducerName][avabileAction][stage])){
                  const argsArray = [data, action.reqPayload, payload];
                  newState = lookup[reducerName][avabileAction][stage](...argsArray);
                  chaining.set(lookup[reducerName][avabileAction][stage].chain,action.type,argsArray);
                } else {
                  const argsArray = [data, action.reqPayload, actionFragments[1], payload];
                  newState = lookup[reducerName][avabileAction](...argsArray);
                  chaining.set(lookup[reducerName][avabileAction].chain,action.type,argsArray)
                } // END else

                async[avabileAction] = (stage === "pending") ? true : (stage === "fulfilled") ? false : payload;

                if(clearFn)//(async[avabileAction] instanceof Error){
                  async[avabileAction].clear = clearFn
           } // END else "clear" !== stage
        } else {
          const argsArray = [data, payload]
          newState = lookup[reducerName][avabileAction](...argsArray);
          chaining.set(lookup[reducerName][avabileAction].chain,action.type,argsArray);
        }
      } else {// if("index" in lookup[reducerName]){

        newState = lookup[reducerName].index(data, Object.assign({},action, {payload}))
      }

      newState = lifecycle[reducerName].after(newState, action, data);

      // check if newState's prototype is the shared Object?
      //console.log (action.type, newState, ({}).__proto__ === newState.__proto__)

      if(newAsyncVal || isAsync[reducerName]){


        if(isObject(newState)){

          const _newProto_ = {}
          Object.defineProperty(_newProto_,"async",  {enumerable:false, value: async})
          Object.defineProperty(_newProto_,"loading",{enumerable:false, value: async})

          //const newStateWithAsync = Object.create(Object.assign(Object.create(newState.__proto__),{async}));
          const newStateWithAsync = Object.create(_newProto_);
          newState = Object.assign(newStateWithAsync,newState); // clone object

        }else if(isArray(newState)){
          // I am a redux-auto proto
          const _newProto_ = Object.create(Array.prototype)

          Object.defineProperty(_newProto_,"async",  {enumerable:false, value: async})
          Object.defineProperty(_newProto_,"loading",{enumerable:false, value: async})

          newState = newState.slice(0); // clone array

          newState.__proto__ = _newProto_;
        } // END isArray
      } // END if(newAsyncVal)
      return newState

    } // END reducers[reducerName] = (data, action) => {
  } // END !(reducerName in reducers)

  // !! index reduers DONT get to overload the action.. sorry :) !!
  if("index" !== actionName){

    const actionPreProcessor = modules(key).action;
    // actionsBuilder[reducerName] = actionsBuilder[reducerName] || {};

    actionsImplementation[reducerName] = actionsImplementation[reducerName] ||  Object.create(actionsBuilderPROTOTYPES[reducerName]);

    actionsImplementation[reducerName][actionName] = (payload,getState) => {
    //actionsBuilder[reducerName][actionName] = (payload,getState) => {

        if(actionPreProcessor){
          if(1 < actionPreProcessor.length){
            return { type: ACTIONID, payload:actionPreProcessor(payload,getState()[reducerName])}
          } // else
          return { type: ACTIONID, payload:actionPreProcessor(payload) }
        } // else
        return { type: ACTIONID, payload }
    } // END actionsBuilder[reducerName][actionName] = (payload = {}) => {
  } // END if(actionName !== "index")
  return actionsImplementation
},{}); //END reduce

//+++++++ replace the place-holders after fully loaded
//++++++++++++++++++++++++++++++++++++++++++++++++++++

Object.assign(actionsBuilder,actionsImplementation);

//+++++++++++++++++++++++++ wrap actions with dispatch
//++++++++++++++++++++++++++++++++++++++++++++++++++++

  return function setDispatch ({ getState, dispatch}) {

   Object.keys(actionsBuilder).forEach( (reducerName) => {

        Object.keys(actionsBuilder[reducerName]).forEach( (actionName) => {
          // hold a ref to the root Fn
          const actionDataFn = actionsBuilder[reducerName][actionName];
          // replace the mapping object pointer the wrappingFn
          actionsBuilder[reducerName][actionName] = function(payload = {}) {

          if(arguments.length > 0 && undefined === arguments[0] || ! isObject(payload)){
            throw new Error(`${typeof arguments[0]} was passed as payload to ${reducerName}.${actionName}. This need to be an object. Check you have not misspelled of the variable`);
          }

            const wrappingFn = actionsBuilder[reducerName][actionName];

            const actionOutput = actionDataFn(payload,getState)
            //should be able to cancel an action by returning undefined from the action
            if(undefined === actionOutput.payload){
              return;
            } else if(isObject(actionOutput.payload)){
              if(isFunction(actionOutput.payload.then)){

                wrappingFn.pending   = ActionIDGen(reducerName, actionName,"pending");
                wrappingFn.fulfilled = ActionIDGen(reducerName, actionName,"fulfilled");
                wrappingFn.rejected  = ActionIDGen(reducerName, actionName,"rejected");
                const clearType      = ActionIDGen(reducerName, actionName,"clear");
                wrappingFn.clear     = ()=> dispatch({type:clearType})
                wrappingFn.clear.toString = ()=> clearType
                actionsBuilderPROTOTYPES[reducerName][wrappingFn.pending]   = actionName;
                actionsBuilderPROTOTYPES[reducerName][wrappingFn.fulfilled] = actionName;
                actionsBuilderPROTOTYPES[reducerName][wrappingFn.rejected]  = actionName;
                actionsBuilderPROTOTYPES[reducerName][clearType]            = actionName;

                dispatch({type:wrappingFn.pending, reqPayload:payload, payload:null})
                chaining(wrappingFn.pending)

                const handleErrors = err => { // only handle external error
                  err.clear = ()=>{dispatch({type:clearType})};
                  //console.info({type:wrappingFn.rejected, reqPayload:payload, payload:err})
                  dispatch({type:wrappingFn.rejected, reqPayload:payload, payload:err})
                  chaining(wrappingFn.rejected)
                }

                actionOutput.payload
                .then(result => {

                    if(true === settingsOptions.smartActions){
                      const smartActionOutPut = smartAction(result)
                      if(smartActionOutPut){
                        smartActionOutPut
                        .then(grafeQLPayload => {
                          dispatch({type:wrappingFn.fulfilled, reqPayload:payload, payload:grafeQLPayload })
                          chaining(wrappingFn.fulfilled)
                        })
                        .catch( errors => {
                           if(Array.isArray(errors)){
                             errors.forEach(handleErrors)
                           } else {
                             handleErrors(errors)
                           }
                        })
                        return;
                      }else
                      if(result.hasOwnProperty("ok")
                      && ! result.ok){
                        handleErrors(result);
                        return;
                      }
                    } // END settingsOptions.smartActions

                  dispatch({type:wrappingFn.fulfilled, reqPayload:payload, payload:result })
                  chaining(wrappingFn.fulfilled)
                },handleErrors)
              } else {
                dispatch(actionOutput);
                chaining(actionOutput.type)
              }
            } else {// if(undefined === actionOutput.payload)
              // because an action-middlware my set a simple value
              throw new Error("action with bad payload:"+actionOutput.type+" >> "+JSON.stringify(actionOutput.payload))
            }
          } // END actionsBuilder[reducerName][actionName] = (payload = {}) =>
          const ACTIONID = ActionIDGen(reducerName, actionName);
          actionsBuilder          [reducerName][actionName].toString = () => ACTIONID;
          actionsBuilderPROTOTYPES[reducerName][ACTIONID]            =      actionName; // a reverse mapping
          //Object.freeze(actionDataFn)
          //actionDataFn.valueOf  = () => Symbol(ACTIONID); // double equales: (()=>{}) == Symbol *true
        })
        // if there is an initialization action, fire it!!
        const init = actionsBuilder[reducerName].init || actionsBuilder[reducerName].INIT
        if (isFunction(init)) {
            init({});
        }
   })
    return next => action => next(action)
 }
}
auto.reset = reset;
auto.settings = function settings(options){
  Object.assign(settingsOptions,options)
}

auto.testing = function testing(options){
  Object.assign(testingOptions,options)
}

export default actionsBuilder;
export { auto, mergeReducers, reducers  }
