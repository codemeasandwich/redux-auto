
export default function (posts, {id}) {
  console.log("posts / delete >> delete post with id",id)
  delete posts[id]
  return posts;
  return posts.filter(post => post.id !== id);
}
