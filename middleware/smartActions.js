
const ValidateDatetime = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01])T(00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9]).([0-9][0-9][0-9])Z$/

function eachRecursive(obj){
    const updatedObj = {}
    for (const k in obj){
      if(Array.isArray(obj[k]))
          updatedObj[k] = obj[k].map(eachRecursive)
      else if (typeof obj[k] === "object" && obj[k] !== null)
            updatedObj[k] = eachRecursive(obj[k]);
        else if (typeof obj[k] === "string")
            updatedObj[k] = ValidateDatetime.test(obj[k]) ? new Date(obj[k]) : obj[k]
        else
            updatedObj[k] = obj[k]
    }
    return updatedObj
}

export default function (response){

  // skip if there's no to "json" function
  if (!response || !response.json) return false;

  return new Promise(function (resolve, reject) {

    // IF you try to return the result.json and Throw inside it
    // You will get "Unhandled promise rejection"
   try{

    response.json().then( jsonresult => {
        if(jsonresult.errors){
            reject( jsonresult.errors.length === 1 ? jsonresult.errors[0] : jsonresult.errors )
              //reject( new Error(jsonresult.errors.map(error => error.message).join()))
         }  else if (jsonresult.errorMessage && jsonresult.errorType) {
          reject(jsonresult)
        }else {
           if(1 === Object.keys(jsonresult).length && "object" === typeof jsonresult.data)
              resolve( jsonresult.data )
           else if(response && response.hasOwnProperty("ok") && ! response.ok){
             reject( response );
           } else {
              resolve( eachRecursive(jsonresult) )
            }
         } // END else
      }) // END response.json()
      //.catch( e=>   resolve( response ) )
       } catch(e){
         // this is the ONLY error that can be found
        // SyntaxError: Unexpected token < in JSON at position 0
        //if(e instanceof SyntaxError){
          resolve( response )
      //  }else {
      //    throw e;
      //  }
      }
    //  .catch((err)=>resolve(response))
  })// END Promise
}
