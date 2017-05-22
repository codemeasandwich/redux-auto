//actions.apps.init
//actions.apps.init.FULFILLED
//actions.apps.init.REJECTED
//actions.apps.init.PENDING

export default function (user, payload, stage) {

  switch(stage){
    case 'FULFILLED':
    console.log("user now loaded from server")
        return { name : payload.name }
      break;
    case 'REJECTED':
    console.error("problem loading user from server",payload)
      break;
    case 'PENDING':
    console.log("wating for user to loaded from server")
    default :
      break;
  }
  return user;
}

export function action (payload){

  return fetch('https://jsonplaceholder.typicode.com/users/1',{
      method: 'GET'
    }).then( data => data.json() );
}
