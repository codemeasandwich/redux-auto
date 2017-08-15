import React  from "preact"
import actions from 'redux-auto'
import { connect } from 'preact-redux'
import ConsoleElem from "./console.jsx"
import BadgesElem from "./badges.jsx"

function Posts(props){
// preact - expends values when passings as children. THIS LOOSE THE PROTO :(
const posts = props.children;

  if( props.loading instanceof Error )
    return <div style={{color:"red"}}> Error: { props.loading.message } <button onClick={props.loading.clear}> clear </button></div>

  if(props.loading)
    return <div> loading posts... </div>

   return <ul> { posts.map( ({title, id}) => (
                <li key={id}>#{id} - {title} <button  onClick={()=>actions.posts.delete({id})} className="close" >
 &times;
</button> </li>
              )) }  </ul>
}

const MainUi = (props) => {
  const { user, posts } = props
  return (
    <div>
    <a href="https://github.com/codemeasandwich/redux-auto" >
        <img style={{ padding: 30 }} src="https://s3-eu-west-1.amazonaws.com/redux-auto/reduxautologo.png" alt="redux-auto" />
    </a>

    <br/>
    <label htmlFor="label-input">Name:</label>
    <input type="text"
             id="label-input"
             onInput={ event => actions.user.changeName({name:event.target.value}) }
             value={user.name}/>  = { (user.loading.init)?"checking..?": <span style={{textShadow: "2px 2px 2px gray"}}>{user.name}</span> }



             <Posts loading={posts.loading.init}>{
                posts
             }</Posts>

             <ConsoleElem/>
    </div>
  )
}

const mapStateToProps = ( { user,posts }) => {
  return { user,posts }
};

export default connect( mapStateToProps )(MainUi);
