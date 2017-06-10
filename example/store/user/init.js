//actions.apps.init
//actions.apps.init.FULFILLED
//actions.apps.init.REJECTED
//actions.apps.init.PENDING

export default function (user, payload, stage, result) {

  switch(stage){
    case 'FULFILLED':
    console.log("user / init(switch : FULFILLED) >> user now loaded from server")
        return { name : result.name }
      break;
    case 'REJECTED':
    console.error("user / init(switch : REJECTED) >> problem loading user from server",result)
      break;
    case 'PENDING':
    console.log("user / init(switch : PENDING) >> wating for user to loaded from server")
    default :
      break;
  }
  return user;
}

export function action (payload){

    console.log("user / init / action >> read API - user")
  return fetch('https://jsonplaceholder.typicode.com/users/1',{
      method: 'GET'
    }).then( data => data.json() );
}
