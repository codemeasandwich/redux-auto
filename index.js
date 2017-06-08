
//=====================================================
//=================== Reducers and Actions from folders
//=====================================================

function ActionIDGen (reducerName, actionName, stage){
  if (3 === arguments.length)
    return reducerName.toUpperCase() + ":" + actionName.toUpperCase() + ">>" + stage.toUpperCase();
  else
    return reducerName.toUpperCase() + ":" + actionName.toUpperCase();
}

const actionsBuilder = {},  lookup = {}, lifecycle = {}
const mappingFromReducerActionNameToACTIONID = {};
const reducersBeforeAutoErrorMessage = "You are trying to get reducers before calling 'auto'. Trying moving applyMiddleware BEFORE combineReducers";
const reducersAfterCombineReducersErrorMessage = "You need to pass an object of reducers to 'mergeReducers' BEFORE calling combineReducers. Try createStore( combineReducers( mergeReducers(otherReducers) ) )";
let autoWasCalled = false, reducers = { auto_function_not_call_before_combineReducers: ()=>{throw new Error(reducersBeforeAutoErrorMessage)} }

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

 function auto (modules, fileNameArray){

   autoWasCalled = true;
   reset();

  fileNameArray.forEach(function(key){

  // get action name
  const actionName = key.match(/([^\/]+)(?=\.\w+$)/)[0];
  // get reducer name
  const reducerName = key.match(/(.*)[\/\\]/)[1].substring(2)||null;

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
      const actionFragments = action.type.split(">>");

      const avabileAction = mappingFromReducerActionNameToACTIONID[reducerName][actionFragments[0]];

      const payload = lifecycle[reducerName].before(data, action);

      // redux-auto ALLOWS has an object payload (other like '@@redux/INIT' will not)
      // before should return a payload object
      if("object" === typeof action.payload && "object" !== typeof payload)
      throw new Error(`${reducerName}-before returned a "${typeof payload}" should be a payload object`)

      let newState = data;

      if(avabileAction in avabileActions){

        if(actionFragments.length > 2)
          throw new Error('bad Action Name:'+action.type)
        else if(actionFragments.length === 2){

          const stage = actionFragments[1].toLowerCase()

            if(  stage === "pending" || stage === "fulfilled" || stage === "rejected" ){
              if ("function" === typeof lookup[reducerName][avabileAction][stage]) {
                newState = lookup[reducerName][avabileAction][stage](data, action.reqPayload, payload)
              } else {
                newState = lookup[reducerName][avabileAction](data, action.reqPayload, actionFragments[1], payload);
              }
            } else {
              throw new Error('bad Action prefix:'+action.type)
            }
        } else {
          newState = lookup[reducerName][avabileAction](data, payload);
        }
      } else {// if("index" in lookup[reducerName]){
        newState = lookup[reducerName].index(data, Object.assign({},action, {payload}))
      }

      return lifecycle[reducerName].after(newState, action, data);

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
             throw new Error(typeof arguments[0]+" was passed as payload. You may have misspelled of the variable");
          }

            const wrappingFn = actionsBuilder[reducerName][actionName];

            const actionOutput = actionDataFn(payload,getState)

            if("object" === typeof actionOutput.payload){
              if(actionOutput.payload.then instanceof Function){
                //if( ! Object.isFrozen(actionDataFn)){
                   wrappingFn.pending   = ActionIDGen(reducerName, actionName,"pending");//actionOutput.type+">>PENDING"
                   wrappingFn.fulfilled = ActionIDGen(reducerName, actionName,"fulfilled");//actionOutput.type+">>FULFILLED"
                   wrappingFn.rejected  = ActionIDGen(reducerName, actionName,"rejected");//actionOutput.type+">>REJECTED"
                //}

                //console.log(Object.isFrozen(actionDataFn),actionDataFn)
                //pending
                dispatch({type:wrappingFn.pending, reqPayload:payload, payload:null})
                actionOutput.payload
                .then(result => dispatch({type:wrappingFn.fulfilled, reqPayload:payload, payload:result }))
                .catch(err => dispatch({type:wrappingFn.rejected, reqPayload:payload, payload:err}))
              } else {
                dispatch(actionOutput);
              }
            } else if(undefined !== typeof actionOutput.payload){  // because an action-middlware my set a simple value
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
