
export default function (response){

  // skip if there's no to "json" function
  if(!response.json) return false;

  return new Promise(function (resolve, reject) {

    // IF you try to return the result.json and Throw inside it
    // You will get "Unhandled promise rejection"
   try{

    response.json().then( jsonresult => {
        if(jsonresult.errors){
            reject( jsonresult.errors.length === 1 ? jsonresult.errors[0] : jsonresult.errors )
              //reject( new Error(jsonresult.errors.map(error => error.message).join()))
         } else {
           if(1 === Object.keys(jsonresult).length && "object" === typeof jsonresult.data)
              resolve( jsonresult.data )
           else
              resolve( jsonresult )
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
