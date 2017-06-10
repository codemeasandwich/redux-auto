
import actions from 'redux-auto'

export default function posts(posts = [], action) {
  console.log("posts / index >> default function for posts | TYPE = ",action.type)
  return posts;
}


