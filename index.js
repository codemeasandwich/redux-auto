/**
//========================================== redux-auto
//======= https://github.com/codemeasandwich/redux-auto
*/
function ActionIDGen (reducerName, actionName, stage){
  if (3 === arguments.length)
    return reducerName.toUpperCase() + "/" + actionName.toUpperCase() + "." + stage.toUpperCase();
  else
    return reducerName.toUpperCase() + "/" + actionName.toUpperCase();
}

const actionsBuilder = {},  lookup = {}, lifecycle = {}
const mappingFromReducerActionNameToACTIONID = {};
const reducersBeforeAutoErrorMessage = "You are trying to get reducers before calling 'auto'. Trying moving applyMiddleware BEFORE combineReducers";
const reducersAfterCombineReducersErrorMessage = "You need to pass an object of reducers to 'mergeReducers' BEFORE calling combineReducers. Try createStore( combineReducers( mergeReducers(otherReducers) ) )";
let autoWasCalled = false, reducers = { auto_function_not_call_before_combineReducers: ()=>{throw new Error(reducersBeforeAutoErrorMessage)} }

function chaining(actionType){
  if(undefined === chaining[actionType])
    return
  if("function" === typeof chaining[actionType]){debugger;chaining[actionType]()}

  else
  throw new Error(`Chaining function used with ${actionType} was not a function. ${typeof chaining[actionType]}`)
}


function reset(){

  Object.keys(actionsBuilder).forEach(p => delete actionsBuilder[p]);
  Object.keys(reducers).forEach(p => delete reducers[p]);
  Object.keys(lookup).forEach(p => delete lookup[p]);
  Object.keys(lifecycle).forEach(p => delete lifecycle[p]);
  Object.keys(mappingFromReducerActionNameToACTIONID).forEach(p => delete mappingFromReducerActionNameToACTIONID[p]);

}

function mergeReducers(otherReducers){

  if(!autoWasCalled)
    throw new Error(reducersBeforeAutoErrorMessage)

  if("function" === typeof otherReducers)
    throw new Error(reducersAfterCombineReducersErrorMessage)

    return Object.assign({},otherReducers, reducers);
}

  function buildActionLayout(fileNameArray){

      fileNameArray.forEach(function(key){

      // get action name
      const actionName = key.match(/([^\/]+)(?=\.\w+$)/)[0];
      // get reducer name
      const reducerName = key.match(/(.*)[\/\\]/)[1].substring(2);//||null;

      if(actionName.includes(".")) throw new Error(`file ${actionName} in ${reducerName} contains a DOT in its name`)
      if(reducerName.includes(".")) throw new Error(`the folder ${reducerName} contains a DOT in its name`)

      // get action name starts with _ skip it
      if(actionName.startsWith("_") || null === reducerName)
          return;


          actionsBuilder[reducerName] = actionsBuilder[reducerName] || {};
          actionsBuilder[reducerName][actionName] = ()=>{ actionsBuilder[reducerName][actionName]() };
    })
  }

 function auto (modules, fileNameArray){

   autoWasCalled = true;
   reset();
  buildActionLayout(fileNameArray)
  fileNameArray.forEach(function(key){

  // get action name
  const actionName = key.match(/([^\/]+)(?=\.\w+$)/)[0];
  // get reducer name
  const reducerName = key.match(/(.*)[\/\\]/)[1].substring(2);//||null;

  if(actionName.includes(".")) throw new Error(`file ${actionName} in ${reducerName} contains a DOT in its name`)
  if(reducerName.includes(".")) throw new Error(`the folder ${reducerName} contains a DOT in its name`)

  // get action name starts with _ skip it
  if(actionName.startsWith("_") || null === reducerName)
      return;

  lookup[reducerName] = lookup[reducerName] || {};
  lookup[reducerName][actionName] = modules(key).default || {};
  lookup[reducerName][actionName].pending   = modules(key).pending   || modules(key).PENDING;
  lookup[reducerName][actionName].fulfilled = modules(key).fulfilled || modules(key).FULFILLED;
  lookup[reducerName][actionName].rejected  = modules(key).rejected  || modules(key).REJECTED;

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
      if("object" === typeof action.payload && "object" !== typeof payload)
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

          if(stage === "clear" ){
            async[avabileAction] = undefined;
          } else {

                let clearFn;
                if(stage === "rejected" ){
                  clearFn = payload.clear;
                  delete payload.clear;
                }

              //    if(  stage === "pending" || stage === "fulfilled" || stage === "rejected" ){
                if ("function" === typeof lookup[reducerName][avabileAction][stage]) {
                  newState = lookup[reducerName][avabileAction][stage](data, action.reqPayload, payload);
                  if("function" === typeof lookup[reducerName][avabileAction][stage].chain){ debugger;
                      chaining[action.type] = lookup[reducerName][avabileAction][stage].chain
                  }
                } else {
                  newState = lookup[reducerName][avabileAction](data, action.reqPayload, actionFragments[1], payload);
                  if("function" === typeof lookup[reducerName][avabileAction].chain){
                      chaining[action.type] = lookup[reducerName][avabileAction].chain
                  }
                }

                async[avabileAction] = (stage === "pending") ? true : (stage === "fulfilled") ? false : payload;

                if(clearFn)//(async[avabileAction] instanceof Error){
                  async[avabileAction].clear = clearFn
           }
        } else {
          newState = lookup[reducerName][avabileAction](data, payload);
          if("function" === typeof lookup[reducerName][avabileAction].chain){
              chaining.after[action.type] = lookup[reducerName][avabileAction].chain
          }
        }
      } else {// if("index" in lookup[reducerName]){

        newState = lookup[reducerName].index(data, Object.assign({},action, {payload}))
      }

      newState = lifecycle[reducerName].after(newState, action, data);

      // check if newState's prototype is the shared Object?
      //console.log (action.type, newState, ({}).__proto__ === newState.__proto__)

      if(newAsyncVal && "object" === typeof newState ){
        // I am a redux-auto proto
        let _p_ = newState.__proto__;
        if(newState.__proto__.hasOwnProperty("async")){
          _p_ = newState.__proto__.__proto__;
        }
        const _newProto_ = {async}
        _newProto_.__proto__ = _p_
        newState.__proto__ = _newProto_;
      }
      return newState

    } // END reducers[reducerName] = (data, action) => {
  } // END !(reducerName in reducers)

  // !! index reduers DONT get to overload the action.. sorry :) !!
  if(actionName !== "index"){

    const actionPreProcessor = modules(key).action;
    actionsBuilder[reducerName] = actionsBuilder[reducerName] || {};

    actionsBuilder[reducerName][actionName] = (payload,getState) => {

        if(actionPreProcessor){
          if(1 < actionPreProcessor.length){
            return { type: ACTIONID, payload:actionPreProcessor(payload,getState()[reducerName])}
          } // else
          return { type: ACTIONID, payload:actionPreProcessor(payload) }
        } // else
        return { type: ACTIONID, payload }
    } // END actionsBuilder[reducerName][actionName] = (payload = {}) => {
  } // END if(actionName !== "index")
});

  return function setDispatch ({ getState, dispatch}) {

   Object.keys(actionsBuilder).forEach( (reducerName) => {

        Object.keys(actionsBuilder[reducerName]).forEach( (actionName) => {
          // hold a ref to the root Fn
          const actionDataFn = actionsBuilder[reducerName][actionName];
          // replace the mapping object pointer the wrappingFn
          actionsBuilder[reducerName][actionName] = function(payload = {}) {

          if(arguments.length > 0 && undefined === arguments[0] || "object" !== typeof payload){
            throw new Error(`${typeof arguments[0]} was passed as payload to ${reducerName}.${actionName}. This need to be an object. Check you have not misspelled of the variable`);
         }

            const wrappingFn = actionsBuilder[reducerName][actionName];

            const actionOutput = actionDataFn(payload,getState)

            if("object" === typeof actionOutput.payload){
              if(actionOutput.payload.then instanceof Function){
                //if( ! Object.isFrozen(actionDataFn)){
                   wrappingFn.pending   = ActionIDGen(reducerName, actionName,"pending");//actionOutput.type+"/PENDING"
                   wrappingFn.fulfilled = ActionIDGen(reducerName, actionName,"fulfilled");//actionOutput.type+"/FULFILLED"
                   wrappingFn.rejected  = ActionIDGen(reducerName, actionName,"rejected");//actionOutput.type+"/REJECTED"
                   wrappingFn.clear     = ActionIDGen(reducerName, actionName,"clear");//actionOutput.type+"/REJECTED"
                //}

                //console.log(Object.isFrozen(actionDataFn),actionDataFn)
                //pending
                dispatch({type:wrappingFn.pending, reqPayload:payload, payload:null})
                chaining(wrappingFn.pending)
                actionOutput.payload
                .then(result => {
                  dispatch({type:wrappingFn.fulfilled, reqPayload:payload, payload:result })
                  chaining(wrappingFn.fulfilled)
                })
                .catch(err => {
                  err.clear = ()=>{dispatch({type:wrappingFn.clear})};
                  dispatch({type:wrappingFn.rejected, reqPayload:payload, payload:err})
                  chaining(wrappingFn.rejected)
                })
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
          actionsBuilder[reducerName][actionName].toString = () => ACTIONID;
          //Object.freeze(actionDataFn)
          //actionDataFn.valueOf  = () => Symbol(ACTIONID); // double equales: (()=>{}) == Symbol *true
        })

        // if there is an initialization action, fire it!!
        const init = actionsBuilder[reducerName].init || actionsBuilder[reducerName].INIT
        if ("function" === typeof init) {
          init();
        }
   })

    return next => action => next(action)
 }
}

export default actionsBuilder;
export { auto, mergeReducers, reducers  }
