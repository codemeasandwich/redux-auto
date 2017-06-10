
export default function (posts, {id}) {
  console.log("posts / delete >> delete post with id",id)
  return posts.filter(post => post.id !== id);
}
