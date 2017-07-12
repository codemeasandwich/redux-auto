
import actions from 'redux-auto'

export default function user(user = { name:"?" }, action) {
  console.log("user / index >> default function for user | TYPE = ",action.type)
  return user;
}

export function before (appsState, action){
  console.log("user / index / before >> every action on behalf of user | TYPE = ",action.type)
  return action.payload;
}

export function after (newAppsState, action, oldAppsState){
  console.log("action",action)
/*  if(action.type == actions.user.changeName){
    console.log("user / index / after >> actions.user.changeName -> you have change the users name")
  }*/
  console.log("user / index / after >> TYPE = ",action.type)
  return newAppsState;
}
