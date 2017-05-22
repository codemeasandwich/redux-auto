
export default function (user, payload) {
  console.log("change name action on user ")
  return { name : payload.name };
}

export function action (payload){
  
  console.log(" ------------------------ ")
  console.log("action-middleware >> change name action on user ")
  return payload;
}
