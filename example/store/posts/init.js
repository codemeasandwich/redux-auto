

export function pending (posts, payload){
    console.log("posts / init / pending")
  return posts
}

export function fulfilled (posts, payload, serverPosts){
    console.log("posts / init / fulfilled")
  return serverPosts
}
export function rejected (posts, payload, error){
    console.log("posts / init / rejected")
  return posts;
}

export function action (payload){

    console.log("posts / action >> read API - posts")
  return fetch('http://jsonplaceholder.typicode.com/posts',{
      method: 'GET'
    }).then( data => data.json() )
      .then( arrayOfPosts => arrayOfPosts.slice(0,10) )
}
