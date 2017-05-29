

export function pending (posts, payload){
  return posts
}

export function fulfilled (posts, payload, serverPosts){
  return serverPosts
}
export function rejected (posts, payload, error){
  return posts;
}

export function action (payload){

  return fetch('http://jsonplaceholder.typicode.com/posts',{
      method: 'GET'
    }).then( data => data.json() )
      .then( arrayOfPosts => arrayOfPosts.slice(0,10) )
}
