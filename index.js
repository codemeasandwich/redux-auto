
//=====================================================
//=================== Reducers and Actions from folders
//=====================================================

function ActionIDGen (reducerName, actionName){
  return reducerName.toUpperCase() + ":" + actionName.toUpperCase();
}


const actionsBuilder = {};
let dynamicReducers = {}, lookup = {}, lifecycle = {}
const mappingFromReducerActionNameToACTIONID = {};

function mergeReducers(otherReducers){
  return Object.assign({},otherReducers, dynamicReducers);
}


export default actionsBuilder;


 function middleware (modules, fileNameArray){
  
  
  fileNameArray.forEach(function(key){

  // get action name
  const actionName = key.match(/([^\/]+)(?=\.\w+$)/)[0];
  // get reducer name
  const reducerName = key.match(/(.*)[\/\\]/)[1].substring(2)||null;

  // get action name starts with _ skip it
  if(actionName.startsWith("_") || null === reducerName)
      return;

  lookup[reducerName] = lookup[reducerName] || {};
  lookup[reducerName][actionName] = modules(key).default;
  
  lifecycle[reducerName] = lifecycle[reducerName] || { // defaults
    before : function defaultBefore(   oldstate, action)           { return action.payload },
    after  : function defaultAfter(updatedState, action, oldState) { return updatedState }
  };
  
  if ("index" === actionName) {
    lifecycle[reducerName].after  = modules(key).after  || lifecycle[reducerName].after;
    lifecycle[reducerName].before = modules(key).before || lifecycle[reducerName].before;
  }

  const ACTIONID = ActionIDGen(reducerName, actionName);
  mappingFromReducerActionNameToACTIONID[ACTIONID] = actionName;

  if(!(reducerName in dynamicReducers)){
    dynamicReducers[reducerName] = (data, action) => {
    
      const avabileActions = lookup[reducerName];
      const actionFragments = action.type.split("_");
      const avabileAction = mappingFromReducerActionNameToACTIONID[actionFragments[0]];

      const payload = lifecycle[reducerName].before(data, action);
      let newState = data;
      
      if(avabileAction in avabileActions){
        
        if(actionFragments.length > 2)
          throw new Error('bad Action Name:'+action.type)
        else if(actionFragments.length === 2){

            if(  actionFragments[1] === "PENDING"   ||
                 actionFragments[1] === "FULFILLED" ||
                 actionFragments[1] === "REJECTED"
              ){
              newState = lookup[reducerName][avabileAction](data, payload, actionFragments[1]);
            } else {
              throw new Error('bad Action prefix:'+action.type)
            }
        } else {
          newState = lookup[reducerName][avabileAction](data, payload);
        }
      } else {// if("index" in lookup[reducerName]){
        newState = lookup[reducerName].index(data, Object.assign({},action, {payload:payload}))
      }
      
      return lifecycle[reducerName].after(newState, action, data);
      
    } // END dynamicReducers[reducerName] = (data, action) => {
  } // END !(reducerName in dynamicReducers)

  // !! index reduers DONT get to overload the action.. sorry :) !!
  if(actionName !== "index"){

    const actionPreProcessor = modules(key).action;
    actionsBuilder[reducerName] = actionsBuilder[reducerName] || {};

    actionsBuilder[reducerName][actionName] = (payload,getState) => {

        if("object" !== typeof payload)
            throw new Error('payload must be an object if set:'+JSON.stringify(payload))

        if(actionPreProcessor){
          if(1 < actionPreProcessor.length){
            return { type: ACTIONID, payload:actionPreProcessor(payload,getState()[reducerName])}
          } // else
          return { type: ACTIONID, payload:actionPreProcessor(payload) }
        } // else
        return { type: ACTIONID, payload:payload }
    } // END actionsBuilder[reducerName][actionName] = (payload = {}) => {
  } // END if(actionName !== "index")
});
  
  return function setDispatch ({ getState, dispatch}) {

   Object.keys(actionsBuilder).forEach( (reducerName) => {
    
        Object.keys(actionsBuilder[reducerName]).forEach( (actionName) => {
          const actionDataFn = actionsBuilder[reducerName][actionName];
          actionsBuilder[reducerName][actionName] = (payload = {}) => {

            const actionOutput = actionDataFn(payload,getState)

            if("object" === typeof actionOutput.payload){
              if(actionOutput.payload.then instanceof Function){
                //pending
                dispatch({type:actionOutput.type+"_PENDING",payload:payload})
                actionOutput.payload
                .then(newPayload => dispatch({type:actionOutput.type+"_FULFILLED",payload:newPayload}))
                .catch(err => dispatch({type:actionOutput.type+"_REJECTED",payload:err}))
              } else {
                dispatch(actionOutput);
              }
            } else if(undefined !== typeof actionOutput.payload){  // because an action-middlware my set a simple value
              throw new Error("action with bad payload:"+actionOutput.type+" >> "+JSON.stringify(actionOutput.payload))
            }
          } // END actionsBuilder[reducerName][actionName] = (payload = {}) =>
          const ACTIONID = ActionIDGen(reducerName, actionName);
          actionsBuilder[reducerName][actionName].toString = () => ACTIONID;
        })
        
        // if there is an initialization action, fire it!!
        if (actionsBuilder[reducerName].init) {
          actionsBuilder[reducerName].init();
        }
   })
   
    return next => action => next(action)
 }
}

export { middleware, mergeReducers  }


