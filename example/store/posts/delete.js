
export default function (posts, {id}) {
  console.log("delete post with id",id)
  return posts.filter(post => post.id !== id);
}
