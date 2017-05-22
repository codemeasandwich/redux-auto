
export default function user(user = { name:"?" }, action) {
  console.log("default function for user")
  return user;
}

export function before (appsState, action){
  console.log(" ======================== ",action.type)
  console.log("BEFORE every action on behalf of user")
  return action.payload;
}

export function after (newAppsState, action, oldAppsState){
  console.log("AFTER every action on behalf of user")
  console.log(" ======================== ",action.type)
  return newAppsState;
}
