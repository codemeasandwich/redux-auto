
export default function (user, payload) {
  console.log("change name action on user =",payload.name )
  return { name : payload.name };
}

export function action (payload){
  console.log("action-middleware >> change name action on user ")
  return payload;
}
